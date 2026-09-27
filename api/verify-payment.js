export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: 'Missing order_id' });

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': "TEST111777232de5648a3e879ce9601032777111",
      'x-client-secret': "6e17dc11_7baf5121b878d8b6b7034de250c34def_tset_am_ksfc".split("").reverse().join("")
    }
  };

  try {
    const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${order_id}`, options);
    const data = await response.json();

    if (data.order_status === 'PAID') {
      res.status(200).json({ success: true, message: 'Payment verified' });
    } else {
      res.status(400).json({ success: false, error: 'Payment not successful yet' });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
