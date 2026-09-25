// Serverless Endpoint: POST /api/payment/webhook
// Idempotent Razorpay Webhook Processor for order.paid and payment.captured events
// Supports Discord Webhooks, WhatsApp Cloud API, and Resend Automated Email Dispatches

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
      username: 'CVRTN Studio Gateway',
      avatar_url: 'https://cvrtn-t-humbnai-l-9ts9.vercel.app/assets/portfolio/portfolio-valorant.jpg',
      embeds: [
        {
          title: '💰 New Sale | CVRTN Studio',
          color: 3066993, // Vibrant Green (#2ECC71)
          fields: [
            {
              name: 'Product',
              value: productName || 'CVRTN Digital Asset',
              inline: true
            },
            {
              name: 'Revenue',
              value: `₹${amount}`,
              inline: true
            },
            {
              name: 'Customer Data',
              value: customerDetails || 'Anonymous Creator',
              inline: false
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'CVRTN Payment Gateway'
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

// Helper Function: Send Automated Email Delivery via Resend API
async function sendResendDeliveryEmail(toEmail, productName, downloadUrl) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !toEmail) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'CVRTN Studio <delivery@cvrtn.com>',
        to: [toEmail],
        subject: `Your ${productName} Asset Download`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b0c10; color: #ffffff; padding: 24px; border-radius: 12px;">
            <h2 style="color: #FFD600;">Your Order is Ready! 🚀</h2>
            <p>Thank you for purchasing <strong>${productName}</strong> from CVRTN'S THumbnaiL Studio.</p>
            <p style="margin-top: 20px;">
              <a href="${downloadUrl}" style="background-color: #00F562; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Download Assets Now</a>
            </p>
            <p style="font-size: 12px; color: #888888; margin-top: 30px;">CVRTN THumbnaiL • Autonomous SaaS Gateway</p>
          </div>
        `
      })
    });
    console.log(`Resend delivery email dispatched to: ${toEmail}`);
  } catch (err) {
    console.warn('Failed to send Resend email:', err.message);
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
      const email = paymentEntity.email || orderEntity.notes?.customerEmail || notes?.email || '';

      const notes = paymentEntity.notes || orderEntity.notes || {};
      const productType = notes.productType || notes.productId || 'asset_pack';
      const userId = notes.userId || 'guest';

      console.log(`ORDER PAID VERIFIED VIA WEBHOOK: Order ${razorpayOrderId}, Payment ${razorpayPaymentId}, Amount ₹${amount}, Email ${email}, ProductType ${productType}, User ${userId}`);

      // Route fulfillment logic based on product tier
      let downloadToken = null;
      let productName = "Unknown Product";
      let customerData = `User ID: ${userId}`;

      switch (productType) {
        case '4k_unlock':
        case 'ai_visual':
        case 'ai-visual': {
          productName = "4K Resolution Unlock (₹49)";
          customerData = `Image ID: ${notes.imageId || '4k_artwork'} | User: ${userId}`;
          console.log(`Unlocking 4K resolution for image: ${notes.imageId || '4k_artwork'}`);
          downloadToken = Buffer.from(JSON.stringify({
            orderId: razorpayOrderId,
            productType: '4k_unlock',
            imageId: notes.imageId,
            exp: Date.now() + 86400000
          })).toString('base64url');
          break;
        }

        case 'custom_commission':
        case 'custom-thumbnail': {
          const discordTag = notes.discordTag || notes.customerEmail || email || 'Not provided';
          productName = "Custom Thumbnail Commission (₹150)";
          customerData = `Discord Tag: ${discordTag} | User: ${userId}`;
          console.log(`New ₹150 Custom Commission request from: ${discordTag}`);
          break;
        }

        case 'asset_pack':
        case 'elements-pack': {
          const targetEmail = notes.email || notes.customerEmail || email;
          productName = "500+ Asset Pack (₹200)";
          customerData = `Email: ${targetEmail || 'N/A'} | User: ${userId}`;
          console.log(`Delivering ₹200 Asset Pack to: ${targetEmail}`);
          
          downloadToken = Buffer.from(JSON.stringify({
            orderId: razorpayOrderId,
            productType: 'asset_pack',
            exp: Date.now() + 7 * 86400000
          })).toString('base64url');

          if (targetEmail) {
            sendResendDeliveryEmail(
              targetEmail,
              '500+ Thumbnail Asset Pack',
              `https://cvrtn-t-humbnai-l-9ts9.vercel.app/api/download?token=${downloadToken}`
            );
          }
          break;
        }

        case 'studio_export':
        case 'studio-export': {
          productName = "Studio 1280x720 Clean PNG Export (₹20)";
          customerData = `Email: ${email || 'N/A'} | User: ${userId}`;
          console.log(`Delivering 1280x720 Clean Studio PNG Export for Order: ${razorpayOrderId}`);
          downloadToken = Buffer.from(JSON.stringify({
            orderId: razorpayOrderId,
            productType: 'studio_export',
            exp: Date.now() + 86400000
          })).toString('base64url');
          break;
        }
      }

      // Fire Discord alert instantly without blocking
      sendDiscordAlert(productName, amount, customerData);

      // Server-side WhatsApp notification trigger if Meta API credentials exist
      if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
        try {
          const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
          const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
          const targetNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '9725920066';

          fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
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
          }).catch(err => console.warn('WhatsApp background trigger:', err.message));
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

    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
