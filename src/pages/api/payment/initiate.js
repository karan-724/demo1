import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, total } = req.body;

    // Validate input
    if (!token || !total) {
      return res.status(400).json({ message: 'Token and total are required' });
    }

    const data = JSON.stringify({
      token,
      total
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://meefo.shop:4000/api/paymentlink?action=initiate',
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