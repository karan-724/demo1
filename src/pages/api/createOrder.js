import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Validate environment variables
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_SECRET_KEY) {
    return res.status(500).json({
      success: false,
      error: "Server configuration error"
    });
  }

  const CASHFREE_CONFIG = {
    CLIENT_ID: process.env.CASHFREE_CLIENT_ID,
    SECRET_KEY: process.env.CASHFREE_SECRET_KEY,
    BASE_URL: "https://api.cashfree.com/pg",
    API_VERSION: "2022-09-01"
  };

  try {
    const { order_amount, customer_details ,order_id} = req.body;
    
    // Validate input
    if (!order_amount || !customer_details || 
        !customer_details.customer_name || 
        !customer_details.customer_email || 
        !customer_details.customer_phone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https'; // Force HTTPS in production
    const host = req.headers.host;

    const headers = {
      "x-client-id": CASHFREE_CONFIG.CLIENT_ID,
      "x-client-secret": CASHFREE_CONFIG.SECRET_KEY,
      "x-api-version": CASHFREE_CONFIG.API_VERSION,
      "Content-Type": "application/json"
    };

    const data = {
      order_id,
      order_amount,
      order_currency: "INR",
      customer_details,
      order_meta: {
        return_url: `${protocol}://${host}/payment-success?order_id=${order_id}`,
        notify_url: `${protocol}://${host}/api/webhook`
      }
    };

    const response = await axios.post(`${CASHFREE_CONFIG.BASE_URL}/orders`, data, { headers });

    return res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: order_id
    });
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to create order",
      details: error.response?.data?.message || error.message
    });
  }
}
