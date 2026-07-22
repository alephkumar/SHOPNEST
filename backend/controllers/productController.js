const Product = require('../models/Product');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products with search, filter, sort, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isActive: true };

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (rating) query.ratings = { $gte: Number(rating) };
  if (inStock === 'true') query.stock = { $gt: 0 };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priceLowToHigh: { price: 1 },
    priceHighToLow: { price: -1 },
    ratingHighToLow: { ratings: -1 },
    popularity: { numReviews: -1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.newest;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    products,
  });
});

// @desc    Get single product by slug or id
// @route   GET /api/products/:idOrSlug
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

  const product = await Product.findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug })
    .populate('category', 'name slug')
    .populate('brand', 'name slug')
    .populate('reviews.user', 'name avatar');

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json({ success: true, product });
});

// @desc    Get related products (same category, excluding current product)
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(8)
    .populate('category', 'name slug');

  res.status(200).json({ success: true, products: related });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  req.body.seller = req.user.id;

  let images = [];
  if (req.files && req.files.length > 0) {
    images = await Promise.all(
      req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataUri = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'shopnest/products',
        });
        return { public_id: result.public_id, url: result.secure_url };
      })
    );
  }

  const product = await Product.create({ ...req.body, images });
  res.status(201).json({ success: true, message: 'Product created successfully', product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (req.files && req.files.length > 0) {
    const newImages = await Promise.all(
      req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataUri = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'shopnest/products',
        });
        return { public_id: result.public_id, url: result.secure_url };
      })
    );
    req.body.images = [...product.images, ...newImages];
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Product updated successfully', product });
});

// @desc    Delete a product (and its Cloudinary images)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  await Promise.all(
    product.images.map((img) =>
      cloudinary.uploader.destroy(img.public_id).catch(() => null)
    )
  );

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Remove a single image from a product
// @route   DELETE /api/products/:id/images/:publicId
// @access  Private/Admin
exports.deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const { publicId } = req.params;
  await cloudinary.uploader.destroy(publicId).catch(() => null);
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();

  res.status(200).json({ success: true, message: 'Image removed', product });
});

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user.id.toString()
  );
  if (alreadyReviewed) {
    return next(new ErrorResponse('You have already reviewed this product', 400));
  }

  product.reviews.push({
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.recalculateRatings();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added successfully' });
});

// @desc    Delete own review (or admin deletes any)
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  if (review.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }

  review.deleteOne();
  product.recalculateRatings();
  await product.save();

  res.status(200).json({ success: true, message: 'Review deleted successfully' });
});
