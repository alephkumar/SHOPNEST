const Category = require('../models/Category');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../config/cloudinary');

exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.status(200).json({ success: true, count: categories.length, categories });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }
  res.status(200).json({ success: true, category });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  let image;
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'shopnest/categories' });
    image = { public_id: result.public_id, url: result.secure_url };
  }

  const category = await Category.create({ ...req.body, image });
  res.status(201).json({ success: true, message: 'Category created', category });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  if (req.file) {
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id).catch(() => null);
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'shopnest/categories' });
    req.body.image = { public_id: result.public_id, url: result.secure_url };
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Category updated', category });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  if (category.image?.public_id) {
    await cloudinary.uploader.destroy(category.image.public_id).catch(() => null);
  }

  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted' });
});
