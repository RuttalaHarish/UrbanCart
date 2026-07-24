/*
 * UrbanCart — Payment Routes
 */

const express = require('express');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all payment endpoints with JWT authentication middleware
router.use(protect);

// Endpoint route definitions
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

module.exports = router;
