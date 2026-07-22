const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  createReview,
  deleteReview,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const validateRequest = require('../middlewares/validateRequest');
const { productValidation, reviewValidation } = require('../utils/validators/productValidators');

router.get('/', getProducts);
router.get('/:idOrSlug', getProduct);
router.get('/:id/related', getRelatedProducts);

router.post(
  '/',
  protect,
  authorize('admin'),
  upload.array('images', 6),
  productValidation,
  validateRequest,
  createProduct
);
router.put('/:id', protect, authorize('admin'), upload.array('images', 6), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.delete('/:id/images/:publicId', protect, authorize('admin'), deleteProductImage);

router.post('/:id/reviews', protect, reviewValidation, validateRequest, createReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

module.exports = router;
