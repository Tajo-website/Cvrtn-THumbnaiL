// Serverless API Endpoint: /api/create-order
// Generates secure orders for CVRTN's THumbnaiL products & custom commissions.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { itemName, amount, customerEmail, notes = '', paymentMethod = 'UPI' } = req.body || {};

    if (!itemName || !amount) {
      return res.status(400).json({ error: 'Item name and amount are required.' });
    }

    const orderId = `CVR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const timestamp = new Date().toISOString();

    const orderPayload = {
      orderId,
      itemName,
      amount: Number(amount),
      currency: 'INR',
      customerEmail: customerEmail || '',
      paymentMethod,
      notes,
      status: 'PENDING_VERIFICATION',
      upiPayee: 'nayeetanish@oksbi',
      createdAt: timestamp
    };

    return res.status(200).json({
      success: true,
      order: orderPayload,
      upiDeepLink: `upi://pay?pa=nayeetanish@oksbi&pn=Tanish%20CVRTN&am=${amount}&cu=INR&tn=${encodeURIComponent(orderId)}`,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=nayeetanish@oksbi%26pn=Tanish%20CVRTN%26am=${amount}%26cu=INR%26tn=${encodeURIComponent(orderId)}`
    });

  } catch (error) {
    console.error('Error in /api/create-order:', error);
    return res.status(500).json({ error: 'Failed to create order.', details: error.message });
  }
}
