// Serverless API Endpoint: /api/verify-payment
// Alias forwarding to production payment signature verification engine

import paymentVerifyHandler from './payment/verify.js';

export default async function handler(req, res) {
  return paymentVerifyHandler(req, res);
}
