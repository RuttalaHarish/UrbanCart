const User = require('../models/User');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get User Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile.',
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Allow updating ONLY name, phone, address
    // Email, Role, Password remain read-only in this controller
    if (req.body.name !== undefined) {
      user.name = req.body.name.trim();
    }
    if (req.body.phone !== undefined) {
      user.phone = req.body.phone.trim();
    }
    if (req.body.address !== undefined) {
      user.address = req.body.address.trim();
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Update User Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating user profile.',
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
