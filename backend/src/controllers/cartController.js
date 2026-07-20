const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get logged-in user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    // Automatically create an empty cart if none exists
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Get Cart Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Add product to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = quantity !== undefined ? Number(quantity) : 1;

    // 1. Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // 2. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Find or Create Cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    // 4. Update quantity if exists, otherwise add item
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    // 5. Save and return populated cart
    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Add To Cart Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error adding to cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Update product quantity in cart
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    // 1. Validation
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    if (quantity === undefined || isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // 2. Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // 3. Find index of product in items array
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // 4. Update quantity, save and return
    cart.items[itemIndex].quantity = qty;
    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Update Cart Item Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart item',
      error: error.message,
    });
  }
};

/**
 * @desc    Remove a product from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validation
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // 3. Find index of product
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // 4. Remove item, save and return
    cart.items.splice(itemIndex, 1);
    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Remove Cart Item Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error removing cart item',
      error: error.message,
    });
  }
};

/**
 * @desc    Clear the entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    } else {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    });
  } catch (error) {
    console.error('Clear Cart Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error clearing cart',
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
