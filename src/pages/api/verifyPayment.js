export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { amount } = req.body;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return res.status(400).json({ success: false, error: 'Valid amount is required' });
  }

  try {
    const apiResponse = await fetch('https://new-ss-lake.vercel.app/api/verifyPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        success: false,
        error: data.error || 'External verification failed',
      });
    }

    return res.status(200).json({
      success: true,
      message: data.message || 'Payment verified via external API',
      data: data.data,
    });

  } catch (error) {
    console.error('External API error:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify payment via external API' });
  }
}
