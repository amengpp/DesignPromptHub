const express = require('express');
const { register, login, getCurrentUser, updateProfile, logout } = require('../controllers/authController.js');
const { authenticateToken } = require('../middleware/auth.js');

const router = express.Router();

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;