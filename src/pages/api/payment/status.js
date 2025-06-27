import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { transaction_id } = req.body;

    // Validate input
    if (!transaction_id) {
      return res.status(400).json({ message: 'Token and total are required' });
    }

    const data = JSON.stringify({
      transaction_id
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://meefo.shop:4000/api/paymentlink?action=status',
      headers: { 
        'Content-Type': 'application/json'
      },
      data: data
    };

    const response = await axios.request(config);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      message: 'Error initiating payment',
      error: error.response?.data || error.message 
    });
  }
}