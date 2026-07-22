const Coupon = require('../models/Coupon');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.status(200).json({ success: true, count: coupons.length, coupons });
});

// @desc    Create a coupon (admin)
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, message: 'Coupon created', coupon });
});

// @desc    Update a coupon (admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
  res.status(200).json({ success: true, message: 'Coupon updated', coupon });
});

// @desc    Delete a coupon (admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
  res.status(200).json({ success: true, message: 'Coupon deleted' });
});

// @desc    Validate a coupon code without applying (used by cart preview)
// @route   GET /api/coupons/validate/:code
// @access  Private
exports.validateCoupon = asyncHandler(async (req, res, next) => {
  const { orderValue } = req.query;
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

  if (!coupon) {
    return next(new ErrorResponse('Invalid coupon code', 404));
  }

  const validation = coupon.isValid(Number(orderValue) || 0);
  if (!validation.valid) {
    return next(new ErrorResponse(validation.message, 400));
  }

  res.status(200).json({
    success: true,
    coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
  });
});
