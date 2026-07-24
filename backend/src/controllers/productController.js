const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, images } = req.body;

    // 1. Validation
    if (!name || !description || price === undefined || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, category, and brand fields',
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
    }

    // 2. Create Product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock: stock || 0,
      images: images || [],
      createdBy: req.user._id, // Set from authMiddleware
    });

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Create Product Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during product creation',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all products with search, category/price filtering, sorting, and backend pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { q, keyword, category, minPrice, maxPrice, sort } = req.query;

    // 1. Read and validate pagination parameters (default page: 1, default limit: 12)
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 12);
    const skip = (page - 1) * limit;

    const queryObject = {};

    // 2. Keyword search (case-insensitive across name, description, brand, category)
    const searchParam = (q || keyword || '').trim();
    if (searchParam) {
      const regex = new RegExp(searchParam, 'i');
      queryObject.$or = [
        { name: regex },
        { description: regex },
        { brand: regex },
        { category: regex },
      ];
    }

    // 3. Category filter (case-insensitive exact match)
    if (category && category.trim()) {
      queryObject.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    // 4. Price range filter ($gte, $lte)
    if (minPrice !== undefined || maxPrice !== undefined) {
      queryObject.price = {};
      if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
        queryObject.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
        queryObject.price.$lte = Number(maxPrice);
      }
      if (Object.keys(queryObject.price).length === 0) {
        delete queryObject.price;
      }
    }

    // 5. Sorting options (using _id as a secondary tie-breaker for deterministic stable pagination)
    let sortOptions = { createdAt: -1, _id: -1 }; // Default: newest
    if (sort === 'price-asc') {
      sortOptions = { price: 1, _id: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1, _id: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1, _id: -1 };
    } else if (sort === 'name-asc') {
      sortOptions = { name: 1, _id: 1 };
    } else if (sort === 'name-desc') {
      sortOptions = { name: -1, _id: -1 };
    }

    // 6. Calculate total document count matching all active filters
    const totalProducts = await Product.countDocuments(queryObject);
    const totalPages = Math.ceil(totalProducts / limit) || 1;

    // 7. Execute paginated query with population, sorting, skip and limit
    const products = await Product.find(queryObject)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      currentPage: page,
      totalPages,
      limit,
      data: products,
    });
  } catch (error) {
    console.error('Get Products Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving products',
      error: error.message,
    });
  }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Query Product
    const product = await Product.findById(id).populate('createdBy', 'name email');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving product detail',
      error: error.message,
    });
  }
};

/**
 * @desc    Update product by ID
 * @route   PUT /api/products/:id
 * @access  Private
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, brand, stock, images } = req.body;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Validate price/stock if provided
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative',
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
    }

    // 3. Find Product
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 4. Update Product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, category, brand, stock, images },
      { returnDocument: 'after', runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Update Product Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating product',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete product by ID
 * @route   DELETE /api/products/:id
 * @access  Private
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // 2. Find Product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // 3. Delete Product
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    console.error('Delete Product Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting product',
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
