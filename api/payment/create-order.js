// Serverless Endpoint: POST /api/payment/create-order
// Production Razorpay Order Creation API with Server-Side Price Lookup

import { getProductById, PRODUCTS } from '../_products.js';

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
    const { productId, customerEmail = '', notes = '' } = req.body || {};

    if (!productId) {
      return res.status(400).json({ error: 'productId is required.' });
    }

    // Server-Side Price & Product Lookup — Never trust client-sent amounts!
    const product = getProductById(productId);

    if (!product) {
      return res.status(400).json({ error: `Invalid productId: "${productId}".` });
    }

    const internalOrderId = `CVR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const amountInPaise = product.price * 100; // Razorpay amounts are in paise

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Production Razorpay Order Creation via official API
    if (keyId && keySecret) {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: product.currency || 'INR',
          receipt: internalOrderId,
          notes: {
            productId: product.id,
            productName: product.name,
            customerEmail: customerEmail || '',
            notes: notes || ''
          }
        })
      });

      const rzpOrder = await rzpRes.json();

      if (!rzpRes.ok) {
        console.error('Razorpay API Order Error:', rzpOrder);
        return res.status(500).json({
          error: 'Failed to create order on Razorpay server.',
          details: rzpOrder.error?.description || 'Razorpay order creation failed.'
        });
      }

      return res.status(200).json({
        success: true,
        razorpayConfigured: true,
        order: {
          internalOrderId,
          razorpayOrderId: rzpOrder.id,
          productId: product.id,
          productName: product.name,
          amount: product.price,
          amountInPaise,
          currency: product.currency,
          keyId: keyId,
          customerEmail,
          notes,
          status: 'CREATED'
        }
      });
    }

    // Graceful Fallback if Razorpay API Credentials are Pending Configuration
    return res.status(200).json({
      success: true,
      razorpayConfigured: false,
      message: 'Razorpay API credentials pending configuration in environment variables. Operating in manual UPI mode.',
      order: {
        internalOrderId,
        razorpayOrderId: null,
        productId: product.id,
        productName: product.name,
        amount: product.price,
        currency: product.currency,
        upiPayee: process.env.WHATSAPP_BUSINESS_NUMBER ? 'nayeetanish@oksbi' : 'nayeetanish@oksbi',
        customerEmail,
        notes,
        status: 'PENDING_VERIFICATION'
      }
    });

  } catch (error) {
    console.error('Error in /api/payment/create-order:', error);
    return res.status(500).json({ error: 'Failed to create payment order.', details: error.message });
  }
}
