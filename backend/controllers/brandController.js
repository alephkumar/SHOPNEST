const Brand = require('../models/Brand');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../config/cloudinary');

exports.getBrands = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find({ isActive: true }).sort('name');
  res.status(200).json({ success: true, count: brands.length, brands });
});

exports.createBrand = asyncHandler(async (req, res, next) => {
  let logo;
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'shopnest/brands' });
    logo = { public_id: result.public_id, url: result.secure_url };
  }

  const brand = await Brand.create({ ...req.body, logo });
  res.status(201).json({ success: true, message: 'Brand created', brand });
});

exports.updateBrand = asyncHandler(async (req, res, next) => {
  let brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new ErrorResponse('Brand not found', 404));
  }

  if (req.file) {
    if (brand.logo?.public_id) {
      await cloudinary.uploader.destroy(brand.logo.public_id).catch(() => null);
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'shopnest/brands' });
    req.body.logo = { public_id: result.public_id, url: result.secure_url };
  }

  brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: 'Brand updated', brand });
});

exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new ErrorResponse('Brand not found', 404));
  }

  if (brand.logo?.public_id) {
    await cloudinary.uploader.destroy(brand.logo.public_id).catch(() => null);
  }

  await brand.deleteOne();
  res.status(200).json({ success: true, message: 'Brand deleted' });
});
