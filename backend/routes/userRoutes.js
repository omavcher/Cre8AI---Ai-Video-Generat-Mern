const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/loginx', async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Debugging ke liye
    res.json({ message: 'Testing successful', data: req.body });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Protected routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/google-auth', userController.googleAuth);

module.exports = router;