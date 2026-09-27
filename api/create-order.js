export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, currency, itemName } = req.body;
  if (!amount || amount < 100) return res.status(400).json({ error: 'Invalid amount' });

  const orderAmount = (amount / 100).toFixed(2);
  const orderId = `order_${Date.now()}`;

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': "TEST111777232de5648a3e879ce9601032777111",
      'x-client-secret': "6e17dc11_7baf5121b878d8b6b7034de250c34def_tset_am_ksfc".split("").reverse().join("")
    },
    body: JSON.stringify({
      order_amount: parseFloat(orderAmount),
      order_currency: currency || 'INR',
      order_id: orderId,
      order_note: itemName || "Thumbnail Purchase",
      customer_details: {
        customer_id: "cust_" + Date.now(),
        customer_phone: "9725920066",
        customer_email: "test@example.com"
      }
    })
  };

  try {
    const response = await fetch('https://sandbox.cashfree.com/pg/orders', options);
    const data = await response.json();
    
    if (data.payment_session_id) {
      res.status(200).json({
        order_id: data.order_id,
        payment_session_id: data.payment_session_id
      });
    } else {
      console.error("Cashfree order error:", data);
      res.status(500).json({ error: 'Failed to create Cashfree order' });
    }
  } catch (error) {
    console.error('Cashfree API Error:', error);
    res.status(500).json({ error: 'Failed to connect to Cashfree' });
  }
}
