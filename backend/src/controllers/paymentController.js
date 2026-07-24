/*
 * UrbanCart — Payment Controller
 */

const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');

/**
 * @desc    Create a new Razorpay order ID
 * @route   POST /api/payments/create-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // 1. Validation check
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payment amount',
      });
    }

    // 2. Convert amount to paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    // 3. Create unique receipt ID
    const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 4. Configure order options
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
    };

    // 5. Initialize order with Razorpay Instance
    const order = await razorpayInstance.orders.create(options);

    return res.status(201).json({
      success: true,
      data: order,
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
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

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
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
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
