// Serverless API Endpoint: /api/create-order
// Alias forwarding to production payment order creation engine

import paymentCreateOrderHandler from './payment/create-order.js';

export default async function handler(req, res) {
  return paymentCreateOrderHandler(req, res);
}
