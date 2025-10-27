const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const { authenticateToken } = require('../middleware/auth.js');
const { ensureConnection } = require('../config/database.js');

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

// 获取当前用户信息
router.get('/profile', authenticateToken, userController.getCurrentUser);

// 更新用户信息
router.put('/profile', authenticateToken, userController.updateProfile);

// 获取用户创建的提示词
router.get('/prompts', authenticateToken, userController.getUserPrompts);

// 获取用户收藏的提示词
router.get('/favorites', authenticateToken, userController.getUserFavorites);

module.exports = router;