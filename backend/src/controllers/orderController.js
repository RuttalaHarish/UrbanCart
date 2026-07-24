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
      // Map valid items to store product ObjectIds back to cart document
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
    });

    const savedOrder = await order.save();

    // 5. Clear user's cart
    cart.items = [];
    await cart.save();

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
 * @desc    Get logged in user orders
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images brand price category')
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
      message: 'Server error while fetching user orders.',
    });
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format.',
      });
    }

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name images brand price category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Check authorization: User can only view their own order unless Admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order.',
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
 * @desc    Get all orders for admin
 * @route   GET /api/orders/all
 * @access  Private (Admin only)
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name images brand price category')
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
 * @desc    Update order status by admin
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid order status.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format.',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    order.orderStatus = orderStatus;
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
 * @desc    Cancel a customer order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (Customer/Admin)
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format.',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Ownership check: customer can only cancel their own order, or admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order.',
      });
    }

    // Business Rule: Allow cancellation ONLY when orderStatus === 'Pending'
    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled.',
      });
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();
    await updatedOrder.populate('items.product', 'name images brand price category');

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
 * @desc    Delete an order by ID
 * @route   DELETE /api/orders/:id
 * @access  Private (Admin only)
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format.',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    await Order.findByIdAndDelete(id);

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
  cancelOrder,
  deleteOrder,
  getDashboardStats,
};
