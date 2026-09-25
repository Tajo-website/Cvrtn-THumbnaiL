// Serverless Endpoint: POST /api/payment/webhook
// Idempotent Razorpay Webhook Processor for order.paid and payment.captured events
// Supports Instant Discord Server Webhook Rich Embed Sales Notifications

import crypto from 'crypto';

// In-memory processed event tracker for serverless warm instances
const processedEvents = new Set();

// Helper Function: Send Discord Rich Embed Alert for New Sales
async function sendDiscordAlert(productName, amount, customerDetails) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.info('DISCORD_WEBHOOK_URL is not configured. Skipping Discord alert.');
    return;
  }

  try {
    const payload = {
      username: 'CVRTN Studio Sales Bot',
      avatar_url: 'https://cvrtn-t-humbnai-l-9ts9.vercel.app/assets/portfolio/portfolio-valorant.jpg',
      embeds: [
        {
          title: '🎉 New CVRTN Studio Sale!',
          color: 3066993, // Green color (#2ECC71)
          fields: [
            {
              name: '📦 Product',
              value: productName || 'CVRTN Digital Asset',
              inline: true
            },
            {
              name: '💰 Amount',
              value: `₹${amount}`,
              inline: true
            },
            {
              name: '👤 Customer',
              value: customerDetails || 'Anonymous Creator',
              inline: false
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'CVRTN THumbnaiL SaaS • Automated Sales Alert'
          }
        }
      ]
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log(`Discord sales alert sent for: ${productName} (₹${amount})`);
  } catch (err) {
    console.warn('Failed to send Discord webhook alert:', err.message);
  }
}

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
      let productName = 'CVRTN Studio Item';
      let customerDetails = email || notes.customerEmail || userId || 'Anonymous Customer';

      switch (productType) {
        case '4k_unlock':
        case 'ai_visual':
        case 'ai-visual': {
          const imageId = notes.imageId || '4k_artwork';
          productName = 'AI 4K Visual Thumbnail Unlock';
          customerDetails = `Email: ${email || 'N/A'} | Image: ${imageId} | User: ${userId}`;
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
          productName = 'Custom "THumbnaiL" Commission';
          customerDetails = `Discord/Email: ${discordTag} | User: ${userId}`;
          console.log(`New ₹150 Custom Commission request from: ${discordTag} (User: ${userId})`);
          break;
        }

        case 'asset_pack':
        case 'elements-pack': {
          const customerEmail = notes.email || notes.customerEmail || email;
          productName = '500+ Viral Elements Pack';
          customerDetails = `Email: ${customerEmail || 'N/A'} | User: ${userId}`;
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
          productName = 'Studio 1280x720 Clean PNG Export';
          customerDetails = `Email: ${email || 'N/A'} | User: ${userId}`;
          console.log(`Delivering 1280x720 Clean Studio PNG Export for Order: ${razorpayOrderId}`);
          downloadToken = Buffer.from(JSON.stringify({
            orderId: razorpayOrderId,
            productType: 'studio_export',
            exp: Date.now() + 86400000
          })).toString('base64url');
          break;
        }
      }

      // Trigger Discord Rich Embed Sales Alert
      await sendDiscordAlert(productName, amount, customerDetails);

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
