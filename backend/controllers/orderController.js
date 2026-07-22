const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

const TAX_RATE = 0.18; // 18% GST - adjust for your jurisdiction
const FREE_SHIPPING_THRESHOLD = 500;
const STANDARD_SHIPPING = 49;

// Recalculates order totals server-side. NEVER trust prices sent from the client -
// always re-derive from the database to prevent price tampering.
const calculateOrderTotals = async (cartItems, couponCode) => {
  let itemsPrice = 0;
  const orderItems = [];

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.product._id || cartItem.product);
    if (!product || !product.isActive) {
      throw new ErrorResponse(`Product no longer available: ${cartItem.product.name || ''}`, 400);
    }
    if (product.stock < cartItem.quantity) {
      throw new ErrorResponse(`Insufficient stock for ${product.name}`, 400);
    }

    const price = product.discountPrice || product.price;
    itemsPrice += price * cartItem.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price,
      quantity: cartItem.quantity,
    });
  }

  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validation = coupon.isValid(itemsPrice);
      if (validation.valid) {
        discountAmount = coupon.calculateDiscount(itemsPrice);
      }
    }
  }

  const discountedSubtotal = itemsPrice - discountAmount;
  const taxPrice = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const shippingPrice = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const totalPrice =
    Math.round((discountedSubtotal + taxPrice + shippingPrice) * 100) / 100;

  return { orderItems, itemsPrice, discountAmount, taxPrice, shippingPrice, totalPrice };
};

// @desc    Create a new order from the user's cart
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    return next(new ErrorResponse('Shipping address and payment method are required', 400));
  }

  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.filter((i) => !i.savedForLater).length === 0) {
    return next(new ErrorResponse('Your cart is empty', 400));
  }

  const activeItems = cart.items.filter((i) => !i.savedForLater);

  const totals = await calculateOrderTotals(activeItems, cart.couponCode);

  const order = await Order.create({
    orderNumber: Order.generateOrderNumber(),
    user: req.user.id,
    items: totals.orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: totals.itemsPrice,
    taxPrice: totals.taxPrice,
    shippingPrice: totals.shippingPrice,
    discountAmount: totals.discountAmount,
    couponCode: cart.couponCode,
    totalPrice: totals.totalPrice,
    isPaid: false, // set true only after payment confirmation webhook (or COD collection)
    status: 'pending',
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Decrement stock now that the order is confirmed placed
  for (const item of totals.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // Increment coupon usage before clearing it off the cart
  if (cart.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: cart.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  // Clear the cart
  cart.items = [];
  cart.couponCode = undefined;
  await cart.save();

  res.status(201).json({ success: true, message: 'Order placed successfully', order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Get single order (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this order', 403));
  }

  res.status(200).json({ success: true, order });
});

// @desc    Track order by order number (public-ish, still requires login)
// @route   GET /api/orders/track/:orderNumber
// @access  Private
exports.trackOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  if (order.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this order', 403));
  }

  res.status(200).json({
    success: true,
    orderNumber: order.orderNumber,
    status: order.status,
    statusHistory: order.statusHistory,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.deliveredAt,
  });
});

// @desc    Request a return
// @route   PUT /api/orders/:id/return
// @access  Private
exports.requestReturn = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  if (order.user.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  if (order.status !== 'delivered') {
    return next(new ErrorResponse('Only delivered orders can be returned', 400));
  }

  order.returnRequest = {
    requested: true,
    reason: req.body.reason,
    status: 'requested',
    requestedAt: new Date(),
  };
  await order.save();

  res.status(200).json({ success: true, message: 'Return request submitted' });
});

// @desc    Cancel an order (only if not yet shipped)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  if (order.user.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized', 403));
  }
  if (!['pending', 'confirmed'].includes(order.status)) {
    return next(new ErrorResponse('Order can no longer be cancelled', 400));
  }

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
  await order.save();

  // Restock items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  res.status(200).json({ success: true, message: 'Order cancelled successfully' });
});

// ==================== ADMIN ====================

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    orders,
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note, trackingNumber } = req.body;
  const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse('Invalid order status', 400));
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || '' });
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();

  res.status(200).json({ success: true, message: 'Order status updated', order });
});

// @desc    Handle return/refund decision (admin)
// @route   PUT /api/orders/:id/return-decision
// @access  Private/Admin
exports.handleReturnDecision = asyncHandler(async (req, res, next) => {
  const { decision } = req.body; // 'approved' | 'rejected' | 'refunded'
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  if (!order.returnRequest.requested) {
    return next(new ErrorResponse('No return request exists for this order', 400));
  }

  order.returnRequest.status = decision;
  await order.save();

  res.status(200).json({ success: true, message: `Return request ${decision}` });
});
