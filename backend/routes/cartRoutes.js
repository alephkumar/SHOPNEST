const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  toggleSaveForLater,
  removeFromCart,
  clearCart,
  applyCoupon,
} = require('../controllers/cartController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', clearCart);
router.post('/apply-coupon', applyCoupon);
router.put('/:itemId', updateCartItem);
router.put('/:itemId/save-for-later', toggleSaveForLater);
router.delete('/:itemId', removeFromCart);

module.exports = router;
