const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getRevenueGraph,
  getOrderStatusBreakdown,
  getTopProducts,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue-graph', getRevenueGraph);
router.get('/order-status-breakdown', getOrderStatusBreakdown);
router.get('/top-products', getTopProducts);

module.exports = router;
