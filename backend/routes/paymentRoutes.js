const express = require('express');
const router = express.Router();

const {
  createPaymentIntent,
  stripeWebhook,
  confirmCodOrder,
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

// NOTE: the webhook route is mounted separately in server.js BEFORE the
// express.json() body parser, because Stripe requires the raw request body
// to verify the signature. It is intentionally NOT re-declared here.

router.post('/create-intent', protect, createPaymentIntent);
router.put('/confirm-cod/:orderId', protect, confirmCodOrder);

module.exports = router;
module.exports.stripeWebhook = stripeWebhook;
