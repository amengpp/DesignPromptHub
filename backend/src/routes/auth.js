const express = require('express');
const { register, login, getCurrentUser, updateProfile, logout } = require('../controllers/authController.js');
const { authenticateToken } = require('../middleware/auth.js');
const { ensureConnection } = require('../config/database.js');

const router = express.Router();

// 中间件：确保数据库连接
router.use(async (req, res, next) => {
  try {
    await ensureConnection();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: '数据库连接失败，请稍后重试'
      }
    });
  }
});

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

module.exports = router;