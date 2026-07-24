/*
 * UrbanCart — Razorpay Client Configuration
 */

const Razorpay = require('razorpay');

// Initialize Razorpay instance using environment key credentials
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

module.exports = razorpayInstance;
