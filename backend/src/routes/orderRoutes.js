const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route('/')
  .get(getUserOrders)
  .post(createOrder);

// Admin-only route to get all orders (Must be before /:id)
router.get('/all', admin, getAllOrders);

// Admin-only route to get dashboard statistics (Must be before /:id)
router.get('/dashboard/stats', admin, getDashboardStats);

// Customer-accessible order cancellation route
router.put('/:id/cancel', cancelOrder);

router.route('/:id')
  .get(getOrderById)
  .delete(admin, deleteOrder);

// Admin-only route to update status
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
