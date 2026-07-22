const Stripe = require('stripe');
const Order = require('../models/Order');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create a Stripe PaymentIntent for an existing order
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  if (order.user.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  if (order.isPaid) {
    return next(new ErrorResponse('Order has already been paid', 400));
  }

  // Stripe expects the smallest currency unit (paise for INR, cents for USD)
  const amountInSmallestUnit = Math.round(order.totalPrice * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: 'inr',
    metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    automatic_payment_methods: { enabled: true },
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Stripe webhook - confirms payment and updates order
// @route   POST /api/payments/webhook
// @access  Public (verified via Stripe signature)
exports.stripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body must be the raw buffer here, not JSON-parsed - see server.js
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    const order = await Order.findById(orderId);
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        updateTime: new Date().toISOString(),
        email: paymentIntent.receipt_email || '',
      };
      order.status = 'confirmed';
      order.statusHistory.push({ status: 'confirmed', note: 'Payment confirmed via Stripe' });
      await order.save();
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    console.log(`Payment failed for order ${paymentIntent.metadata.orderId}`);
  }

  res.status(200).json({ received: true });
});

// @desc    Mark a COD order as confirmed (no online payment needed)
// @route   PUT /api/payments/confirm-cod/:orderId
// @access  Private
exports.confirmCodOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  if (order.user.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  if (order.paymentMethod !== 'cod') {
    return next(new ErrorResponse('This order is not a Cash on Delivery order', 400));
  }

  order.status = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', note: 'Cash on Delivery order confirmed' });
  await order.save();

  res.status(200).json({ success: true, message: 'Order confirmed', order });
});
