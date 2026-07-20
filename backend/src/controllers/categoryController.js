const mongoose = require('mongoose');
const Category = require('../models/Category');

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    // 1. Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name',
      });
    }

    // 2. Check duplicate
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    // 3. Create Category
    const category = await Category.create({
      name,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Create Category Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during category creation',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error('Get Categories Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving categories',
      error: error.message,
    });
  }
};

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    // 2. Query Category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Get Category By ID Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving category detail',
      error: error.message,
    });
  }
};

/**
 * @desc    Update category by ID
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, isActive } = req.body;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    // 2. Check if Category exists
    let category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // 3. Handle name duplicates if changing name
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists',
        });
      }
    }

    // 4. Update Category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, image, isActive },
      { returnDocument: 'after', runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Update Category Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating category',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete category by ID
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    // 2. Query Category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // 3. Delete Category
    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Category removed successfully',
    });
  } catch (error) {
    console.error('Delete Category Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting category',
      error: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
