const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

/**
 * @desc    Create a new order from active cart items
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // 1. Validate Shipping Address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all shipping address fields',
      });
    }

    // 2. Retrieve user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty',
      });
    }

    // 3. Process items and calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: 'Cart contains an invalid or missing product',
        });
      }
      
      const price = item.product.price;
      totalAmount += price * item.quantity;

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        priceAtPurchase: price,
      });
    }

    // 4. Create the Order document
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100, // round to 2 decimal points
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      orderStatus: 'Pending',
      paymentStatus: 'Pending',
    });

    // 5. Clear the user's cart items
    cart.items = [];
    await cart.save();

    // 6. Populate product details and return
    await order.populate('items.product');

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create Order Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during order creation',
      error: error.message,
    });
  }
};

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get Orders Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user orders',
      error: error.message,
    });
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private (Owner or Admin)
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    // 2. Fetch Order
    const order = await Order.findById(id).populate('items.product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // 3. Owner or Admin authorization check
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get Order Detail Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving order detail',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders/all
 * @access  Private (Admin only)
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('items.product')
      .populate('user', 'name email');

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Admin Get All Orders Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving all orders',
      error: error.message,
    });
  }
};

/**
 * @desc    Update order status or payment status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    // 2. Fetch Order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // 3. Update values
    if (orderStatus) {
      const validOrderStatus = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      if (!validOrderStatus.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid orderStatus. Must be one of: ${validOrderStatus.join(', ')}`,
        });
      }
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      const validPaymentStatus = ['Pending', 'Paid', 'Failed'];
      if (!validPaymentStatus.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid paymentStatus. Must be one of: ${validPaymentStatus.join(', ')}`,
        });
      }
      order.paymentStatus = paymentStatus;
    }

    // 4. Save and return updated order
    await order.save();
    await order.populate('items.product');

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Update Order Status Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating order status',
      error: error.message,
    });
  }
};

/**
 * @desc    Get dashboard statistics for admin
 * @route   GET /api/orders/stats
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        revenue,
      },
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics.',
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
