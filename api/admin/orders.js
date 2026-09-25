// Serverless Endpoint: GET/POST /api/admin/orders
// Protected Admin Dashboard API for order management, manual proof approvals, and analytics

import crypto from 'crypto';
import { manualOrdersStore } from '../payment/upload-proof.js';
import { getProductById } from '../_products.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Admin-Key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Admin Key Authentication Security Check
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'cvrtn_admin_super_secret_key_2026';
  const providedKey = req.headers['x-admin-key'] || req.query?.adminKey || req.body?.adminKey;

  if (!providedKey || providedKey !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized. Valid X-Admin-Key is required to access admin routes.' });
  }

  // GET: List all orders and manual proofs
  if (req.method === 'GET') {
    const ordersList = Array.from(manualOrdersStore.values());
    return res.status(200).json({
      success: true,
      totalOrders: ordersList.length,
      pendingReviews: ordersList.filter(o => o.status === 'PENDING_REVIEW').length,
      approvedOrders: ordersList.filter(o => o.status === 'PAID').length,
      orders: ordersList
    });
  }

  // POST: Admin Actions (Approve / Reject Order)
  if (req.method === 'POST') {
    const { action, orderId } = req.body || {};

    if (!orderId || !manualOrdersStore.has(orderId)) {
      return res.status(404).json({ error: `Order ID "${orderId}" not found.` });
    }

    const order = manualOrdersStore.get(orderId);

    if (action === 'approve') {
      order.status = 'PAID';
      order.adminApproved = true;
      order.reviewedAt = new Date().toISOString();

      const product = getProductById(order.productId);
      const downloadSecret = process.env.DOWNLOAD_JWT_SECRET || 'cvrtn_secure_download_signing_token_secret_998877';
      const signedToken = crypto.createHmac('sha256', downloadSecret).update(`${orderId}:${product?.id || 'product'}`).digest('hex');

      order.downloadUrl = `/api/download?orderId=${orderId}&productId=${product?.id || 'elements-pack'}&token=${signedToken}`;
      manualOrdersStore.set(orderId, order);

      return res.status(200).json({
        success: true,
        message: `Order ${orderId} approved by admin. Status updated to PAID.`,
        order
      });
    }

    if (action === 'reject') {
      order.status = 'REJECTED';
      order.adminApproved = false;
      order.reviewedAt = new Date().toISOString();
      manualOrdersStore.set(orderId, order);

      return res.status(200).json({
        success: true,
        message: `Order ${orderId} marked as REJECTED.`,
        order
      });
    }

    return res.status(400).json({ error: 'Invalid admin action. Use "approve" or "reject".' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
