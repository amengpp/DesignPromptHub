const express = require('express');
const {
  getCategories,
  getCategoryById,
  getSubcategoriesByCategory,
  getSubcategoryById
} = require('../controllers/categoryController.js');
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

// 获取所有分类
router.get('/', getCategories);

// 获取单个分类详情
router.get('/:id', getCategoryById);

// 获取分类下的子分类列表
router.get('/:categoryId/subcategories', getSubcategoriesByCategory);

// 获取单个子分类详情
router.get('/subcategories/:id', getSubcategoryById);

module.exports = router;