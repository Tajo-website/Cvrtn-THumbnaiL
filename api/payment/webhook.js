// Serverless Endpoint: POST /api/payment/webhook
// Idempotent Razorpay Webhook Processor for order.paid and payment.captured events

import crypto from 'crypto';

// In-memory processed event tracker for serverless warm instances
const processedEvents = new Set();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      if (!signature) {
        return res.status(400).json({ error: 'Missing X-Razorpay-Signature header.' });
      }

      const bodyText = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyText)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Razorpay Webhook Signature Mismatch!');
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventId = payload?.event_id || payload?.payload?.payment?.entity?.id || `evt_${Date.now()}`;

    // Idempotency check: prevent duplicate processing
    if (processedEvents.has(eventId)) {
      console.log(`Webhook Event ${eventId} already processed. Skipping duplicate.`);
      return res.status(200).json({ status: 'already_processed', eventId });
    }

    processedEvents.add(eventId);
    // Limit memory set size
    if (processedEvents.size > 1000) {
      const first = processedEvents.values().next().value;
      processedEvents.delete(first);
    }

    const eventType = payload?.event;
    console.log(`Processing Razorpay Webhook Event: ${eventType} (${eventId})`);

    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = payload?.payload?.payment?.entity || {};
      const orderEntity = payload?.payload?.order?.entity || {};

      const razorpayOrderId = paymentEntity.order_id || orderEntity.id;
      const razorpayPaymentId = paymentEntity.id;
      const amount = (paymentEntity.amount || orderEntity.amount || 0) / 100;
      const email = paymentEntity.email || orderEntity.notes?.customerEmail || '';

      const notes = paymentEntity.notes || orderEntity.notes || {};
      const productType = notes.productType || notes.productId || 'asset_pack';
      const userId = notes.userId || 'guest';

      console.log(`ORDER PAID VERIFIED VIA WEBHOOK: Order ${razorpayOrderId}, Payment ${razorpayPaymentId}, Amount ₹${amount}, Email ${email}, ProductType ${productType}, User ${userId}`);

      // Route fulfillment logic based on product tier
      let downloadToken = null;

      switch (productType) {
        case '4k_unlock':
        case 'ai_visual':
        case 'ai-visual': {
          const imageId = notes.imageId || '4k_artwork';
          console.log(`Unlocking 4K resolution for image: ${imageId} (User: ${userId})`);
          downloadToken = Buffer.from(JSON.stringify({
            orderId: razorpayOrderId,
            productType: '4k_unlock',
            imageId,
            exp: Date.now() + 86400000
          })).toString('base64url');
          break;
        }

        case 'custom_commission':
        case 'custom-thumbnail': {
          const discordTag = notes.discordTag || notes.customerEmail || email || 'Client';
          console.log(`New ₹150 Custom Commission request from: ${discordTag} (User: ${userId})`);
          break;
        }

        case 'asset_pack':
        case 'elements-pack': {
          const customerEmail = notes.email || notes.customerEmail || email;
          console.log(`Delivering ₹200 500+ Asset Pack to: ${customerEmail}`);
          downloadToken = Buffer.from(JSON.stringify({
            orderId: razorpayOrderId,
            productType: 'asset_pack',
            exp: Date.now() + 7 * 86400000
          })).toString('base64url');
          break;
        }

        case 'studio_export':
        case 'studio-export': {
          console.log(`Delivering 1280x720 Clean Studio PNG Export for Order: ${razorpayOrderId}`);
          downloadToken = Buffer.from(JSON.stringify({
            orderId: razorpayOrderId,
            productType: 'studio_export',
            exp: Date.now() + 86400000
          })).toString('base64url');
          break;
        }
      }

      // Server-side WhatsApp notification trigger if Meta API credentials exist
      if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
        try {
          const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
          const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
          const targetNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '9725920066';

          await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${waToken}`
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: targetNumber.startsWith('91') ? targetNumber : `91${targetNumber}`,
              type: 'template',
              template: {
                name: process.env.WHATSAPP_ORDER_TEMPLATE || 'order_confirmation',
                language: { code: 'en_US' }
              }
            })
          });
        } catch (waErr) {
          console.warn('WhatsApp API webhook dispatch fallback:', waErr.message);
        }
      }

      return res.status(200).json({
        status: 'success',
        eventId,
        event: eventType,
        productType,
        downloadToken: downloadToken || null
      });
    }

  } catch (error) {
    console.error('Error in /api/payment/webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed.', details: error.message });
  }
}
