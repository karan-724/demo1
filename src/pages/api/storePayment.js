import PaymentSMS from '@/models/PaymentSMS';
import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  await connectToDatabase();

  // Handle POST request: Store a new message
  if (req.method === 'POST') {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Extract amount using regex
    const amountMatch = message.match(/(?:Rs\.?|INR|₹)\s?(\d+(?:\.\d{1,2})?)/i);
    if (!amountMatch) {
      return res.status(400).json({ success: false, error: 'Amount not found in message' });
    }

    const amount = parseFloat(amountMatch[1]);
    if (isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Invalid amount format' });
    }

    try {
      const insertResult = await PaymentSMS.create({
        message,
        amount,
        verified: false,
      });

      return res.status(200).json({
        success: true,
        message: 'Payment SMS stored successfully',
        data: {
          id: insertResult._id,
          amount,
          message,
        },
      });
    } catch (error) {
      console.error('DB insert error:', error);
      return res.status(500).json({ success: false, error: 'Database insert failed' });
    }
  }

  // Handle GET request: Fetch all messages or latest one
  if (req.method === 'GET') {
    const { latest } = req.query;

    try {
      let data;
      if (latest === 'true') {
        // Fetch the latest message
        data = await PaymentSMS.findOne().sort({ createdAt: -1 });
      } else {
        // Fetch all messages
        data = await PaymentSMS.find().sort({ createdAt: -1 });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('DB fetch error:', error);
      return res.status(500).json({ success: false, error: 'Database fetch failed' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Only POST and GET allowed' });
}
