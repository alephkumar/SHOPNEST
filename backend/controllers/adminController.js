const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get admin dashboard summary stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalOrders,
    totalUsers,
    totalProducts,
    paidOrdersAgg,
    pendingOrders,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments({ status: 'pending' }),
    Product.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
  ]);

  const totalRevenue = paidOrdersAgg[0]?.totalRevenue || 0;
  const totalPaidOrders = paidOrdersAgg[0]?.count || 0;

  res.status(200).json({
    success: true,
    stats: {
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      totalPaidOrders,
      pendingOrders,
      lowStockProducts,
    },
    recentOrders,
  });
});

// @desc    Get revenue data grouped by day for the last N days (for a graph)
// @route   GET /api/admin/revenue-graph?days=30
// @access  Private/Admin
exports.getRevenueGraph = asyncHandler(async (req, res, next) => {
  const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 30));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const data = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({ success: true, days, data });
});

// @desc    Get order status breakdown (for a pie/donut chart)
// @route   GET /api/admin/order-status-breakdown
// @access  Private/Admin
exports.getOrderStatusBreakdown = asyncHandler(async (req, res, next) => {
  const breakdown = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({ success: true, breakdown });
});

// @desc    Get top-selling products
// @route   GET /api/admin/top-products
// @access  Private/Admin
exports.getTopProducts = asyncHandler(async (req, res, next) => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  const topProducts = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ]);

  res.status(200).json({ success: true, topProducts });
});
