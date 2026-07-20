const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

// Admin-only route to get all orders (Must be before /:id)
router.get('/all', admin, getAllOrders);

// Admin-only route to get dashboard statistics (Must be before /:id)
router.get('/dashboard/stats', admin, getDashboardStats);

router.route('/:id')
  .get(getOrderById);

// Admin-only route to update status
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
