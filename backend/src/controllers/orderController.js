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

    // 2b. Auto-Cleanup: Detect and remove invalid/deleted products
    const initialItemCount = cart.items.length;
    const validItems = cart.items.filter((item) => item.product !== null);

    if (validItems.length < initialItemCount) {
      cart.items = validItems.map((item) => ({
        product: item.product._id || item.product,
        quantity: item.quantity,
      }));
      await cart.save();

      return res.status(409).json({
        success: false,
        cartUpdated: true,
        message:
          'Some products in your cart are no longer available. They have been removed automatically. Please review your cart before placing your order.',
      });
    }

    // 3. Process items and calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const itemTotal = item.product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      });
    }

    // 4. Create and save order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      totalAmount,
      paymentStatus: 'Pending',
    });

    const savedOrder = await order.save();

    // 5. Clear user's cart (only for COD immediately; for RAZORPAY, cart is cleared upon verification)
    if (paymentMethod !== 'RAZORPAY') {
      cart.items = [];
      await cart.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: savedOrder,
    });
  } catch (error) {
    console.error('Create Order Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating order.',
    });
  }
};

/**
 * @desc    Get all orders for logged-in user
 * @route   GET /api/orders
 * @access  Private
 */
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price images category brand')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get User Orders Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders.',
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(id).populate(
      'items.product',
      'name price images category brand'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Authorization check: User can only view their own order unless Admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
    console.error('Get Order By ID Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching order details.',
    });
  }
};

/**
 * @desc    Cancel order (User or Admin)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Authorization check
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Prevent cancellation if already shipped or delivered
    if (['Shipped', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already ${order.orderStatus}`,
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled',
      });
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Cancel Order Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling order.',
    });
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/all
 * @access  Private/Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get All Orders Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching all orders.',
    });
  }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (orderStatus) {
      const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status value',
        });
      }
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['Pending', 'Paid', 'Failed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status value',
        });
      }
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update Order Status Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating order status.',
    });
  }
};

/**
 * @desc    Delete order (Admin only)
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Delete Order Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting order.',
    });
  }
};

/**
 * @desc    Get dashboard metrics (Admin only)
 * @route   GET /api/orders/dashboard/stats
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0] ? revenueResult[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while calculating dashboard stats.',
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getDashboardStats,
};
