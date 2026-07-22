const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'wishlist',
    select: 'name price discountPrice images stock ratings',
  });

  res.status(200).json({ success: true, wishlist: user.wishlist });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const user = await User.findById(req.user.id);
  if (user.wishlist.includes(req.params.productId)) {
    return next(new ErrorResponse('Product already in wishlist', 400));
  }

  user.wishlist.push(req.params.productId);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Added to wishlist' });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { wishlist: req.params.productId },
  });

  res.status(200).json({ success: true, message: 'Removed from wishlist' });
});
