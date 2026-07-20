const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

/**
 * @desc    Get logged-in user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

    // Automatically create an empty wishlist if none exists
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error('Get Wishlist Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving wishlist',
      error: error.message,
    });
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

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

    // 2. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Find or Create Wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    // 4. Prevent duplicates
    const productExists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (productExists) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // 5. Add product, save and return populated wishlist
    wishlist.products.push(productId);
    await wishlist.save();
    await wishlist.populate('products');

    return res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error('Add To Wishlist Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error adding to wishlist',
      error: error.message,
    });
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validation
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    // 3. Verify product is in wishlist
    const productIndex = wishlist.products.findIndex(
      (id) => id.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // 4. Remove product, save and return
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();
    await wishlist.populate('products');

    return res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error('Remove From Wishlist Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error removing product from wishlist',
      error: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
