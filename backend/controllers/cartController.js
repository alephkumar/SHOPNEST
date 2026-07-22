const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get logged-in user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate({
    path: 'items.product',
    select: 'name price discountPrice images stock isActive',
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Filter out any items whose product was deleted
  cart.items = cart.items.filter((item) => item.product);

  const activeItems = cart.items.filter((i) => !i.savedForLater);
  const subtotal = activeItems.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  res.status(200).json({ success: true, cart, subtotal });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new ErrorResponse('Product not found', 404));
  }
  if (product.stock < quantity) {
    return next(new ErrorResponse(`Only ${product.stock} units available in stock`, 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId && !item.savedForLater
  );

  if (existingItem) {
    const newQty = existingItem.quantity + Number(quantity);
    if (product.stock < newQty) {
      return next(new ErrorResponse(`Only ${product.stock} units available in stock`, 400));
    }
    existingItem.quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity) });
  }

  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name price discountPrice images stock' });

  res.status(200).json({ success: true, message: 'Added to cart', cart });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  if (quantity < 1) {
    return next(new ErrorResponse('Quantity must be at least 1', 400));
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return next(new ErrorResponse('Cart item not found', 404));
  }

  const product = await Product.findById(item.product);
  if (product && product.stock < quantity) {
    return next(new ErrorResponse(`Only ${product.stock} units available in stock`, 400));
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name price discountPrice images stock' });

  res.status(200).json({ success: true, message: 'Cart updated', cart });
});

// @desc    Toggle "save for later" on a cart item
// @route   PUT /api/cart/:itemId/save-for-later
// @access  Private
exports.toggleSaveForLater = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return next(new ErrorResponse('Cart item not found', 404));
  }

  item.savedForLater = !item.savedForLater;
  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name price discountPrice images stock' });

  res.status(200).json({ success: true, cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
  await cart.save();
  await cart.populate({ path: 'items.product', select: 'name price discountPrice images stock' });

  res.status(200).json({ success: true, message: 'Item removed from cart', cart });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], couponCode: null });
  res.status(200).json({ success: true, message: 'Cart cleared' });
});

// @desc    Apply a coupon code to the cart
// @route   POST /api/cart/apply-coupon
// @access  Private
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return next(new ErrorResponse('Cart is empty', 400));
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    return next(new ErrorResponse('Invalid coupon code', 404));
  }

  const activeItems = cart.items.filter((i) => !i.savedForLater);
  const subtotal = activeItems.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const validation = coupon.isValid(subtotal);
  if (!validation.valid) {
    return next(new ErrorResponse(validation.message, 400));
  }

  cart.couponCode = coupon.code;
  await cart.save();

  const discount = coupon.calculateDiscount(subtotal);

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    discount,
    total: subtotal - discount,
  });
});
