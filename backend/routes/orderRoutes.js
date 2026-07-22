const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrder,
  trackOrder,
  requestReturn,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  handleReturnDecision,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/track/:orderNumber', trackOrder);
router.get('/:id', getOrder);
router.put('/:id/return', requestReturn);
router.put('/:id/cancel', cancelOrder);

// Admin
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);
router.put('/:id/return-decision', authorize('admin'), handleReturnDecision);

module.exports = router;
