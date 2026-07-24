/*
 * UrbanCart — Payment Controller
 */

const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

/**
 * @desc    Create a new Razorpay order ID linked to a MongoDB order
 * @route   POST /api/payments/create-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    let targetOrder = null;
    let paymentAmount = amount;

    if (orderId) {
      targetOrder = await Order.findById(orderId);
      if (!targetOrder) {
        return res.status(404).json({
          success: false,
          message: 'Associated order not found',
        });
      }
      paymentAmount = targetOrder.totalAmount;
    }

    // 1. Validation check
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payment amount',
      });
    }

    // 2. Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(paymentAmount * 100);

    // 3. Create unique receipt ID
    const receiptId = orderId
      ? `rcpt_${orderId.toString().slice(-12)}`
      : `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 4. Configure order options
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
    };

    // 5. Initialize order with Razorpay Instance
    const razorpayOrder = await razorpayInstance.orders.create(options);

    // 6. Save Razorpay Order ID to MongoDB document
    if (targetOrder) {
      targetOrder.razorpayOrderId = razorpayOrder.id;
      await targetOrder.save();
    }

    return res.status(201).json({
      success: true,
      data: razorpayOrder,
    });
  } catch (error) {
    console.error('Create Razorpay Order Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize payment gateway order',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature & update MongoDB order to Paid
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Verification input validation checks
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required validation parameter keys',
      });
    }

    // 2. Format signature body to sign
    const signBody = `${razorpay_order_id}|${razorpay_payment_id}`;

    // 3. Generate HMAC SHA256 signature using Razorpay secret key
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
      .update(signBody)
      .digest('hex');

    // 4. Compare generated signature with incoming signature safely
    if (generatedSignature === razorpay_signature) {
      // 5. Find target MongoDB order by orderId or razorpay_order_id
      let targetOrder = null;
      if (orderId) {
        targetOrder = await Order.findById(orderId);
      }
      if (!targetOrder && razorpay_order_id) {
        targetOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      }

      if (targetOrder) {
        targetOrder.paymentStatus = 'Paid';
        targetOrder.razorpayOrderId = razorpay_order_id;
        targetOrder.razorpayPaymentId = razorpay_payment_id;
        targetOrder.razorpaySignature = razorpay_signature;
        await targetOrder.save();

        // Clear user's cart upon successful verification
        await Cart.findOneAndUpdate(
          { user: targetOrder.user },
          { $set: { items: [] } }
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully and order marked as Paid',
        data: targetOrder,
      });
    } else {
      // Signature verification failed — mark order payment status as Failed
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Failed' });
      } else if (razorpay_order_id) {
        await Order.findOneAndUpdate(
          { razorpayOrderId: razorpay_order_id },
          { paymentStatus: 'Failed' }
        );
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature.',
      });
    }
  } catch (error) {
    console.error('Verify Payment Signature Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment signature details',
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
