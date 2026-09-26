import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency, receipt } = req.body;
  
  if (!amount || amount < 100) {
    return res.status(400).json({ error: 'Amount must be at least 100 paise' });
  }

  try {
    const rzp = new Razorpay({
      key_id: "rzp_test_Tga7ldfHzH1m8o",
      key_secret: "dYeikrpROJG7hTci4ye7QYXM",
    });

    const order = await rzp.orders.create({
      amount: parseInt(amount),
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`
    });

    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    if (error.statusCode === 401) {
       return res.status(401).json({ error: 'Authentication failed with Razorpay' });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
}
