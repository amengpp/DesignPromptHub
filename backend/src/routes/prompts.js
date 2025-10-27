const express = require('express');
const {
  getPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  getMyPrompts
} = require('../controllers/promptController.js');
const { authenticateToken, optionalAuth } = require('../middleware/auth.js');
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

// 获取提示词列表（可选认证）
router.get('/', optionalAuth, getPrompts);

// 获取当前用户的提示词（需要认证）
router.get('/my', authenticateToken, getMyPrompts);

// 获取提示词详情（可选认证）
router.get('/:id', optionalAuth, getPromptById);

// 创建新提示词（需要认证）
router.post('/', authenticateToken, createPrompt);

// 更新提示词（需要认证）
router.put('/:id', authenticateToken, updatePrompt);

// 删除提示词（需要认证）
router.delete('/:id', authenticateToken, deletePrompt);

module.exports = router;