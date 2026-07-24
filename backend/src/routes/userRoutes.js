const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all user profile routes
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

module.exports = router;
