// Serverless Endpoint: POST /api/payment/upload-proof
// Saves manual payment proof under PENDING_REVIEW status (NEVER marks order as PAID automatically!)

import { getProductById } from '../_products.js';

// In-memory store for manual proof reviews
export const manualOrdersStore = new Map();

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
    const { productId, customerEmail, notes = '', screenshotData = null } = req.body || {};

    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid customer email is required.' });
    }

    const product = getProductById(productId);
    const orderId = `CVR-PROOF-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const submittedAt = new Date().toISOString();

    const orderRecord = {
      orderId,
      productId: product?.id || 'custom-thumbnail',
      productName: product?.name || 'CVRTN Service',
      amount: product?.price || 150,
      customerEmail,
      notes,
      screenshotAttached: Boolean(screenshotData),
      status: 'PENDING_REVIEW', // CRITICAL: Screenshots MUST NOT auto-mark orders as PAID!
      submittedAt,
      reviewedAt: null,
      adminApproved: false
    };

    manualOrdersStore.set(orderId, orderRecord);

    console.log(`MANUAL PAYMENT PROOF SUBMITTED: ${orderId} (${customerEmail}) - Status: PENDING_REVIEW`);

    const whatsappNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '9725920066';
    const waText = encodeURIComponent(
      `*MANUAL PAYMENT PROOF SUBMITTED*\n\n📦 *Item:* ${orderRecord.productName}\n💰 *Amount:* ₹${orderRecord.amount}\n🧾 *Order ID:* ${orderId}\n📧 *Customer Email:* ${customerEmail}\n📅 *Timeline:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n⚠️ *Status:* PENDING_REVIEW\n\n_Proof submitted on site. Admin verification pending._`
    );

    return res.status(200).json({
      success: true,
      status: 'PENDING_REVIEW',
      message: 'Payment proof submitted successfully. Order is pending admin review.',
      order: orderRecord,
      whatsappNotificationUrl: `https://api.whatsapp.com/send?phone=91${whatsappNumber}&text=${waText}`
    });

  } catch (error) {
    console.error('Error in /api/payment/upload-proof:', error);
    return res.status(500).json({ error: 'Proof upload failed.', details: error.message });
  }
}
