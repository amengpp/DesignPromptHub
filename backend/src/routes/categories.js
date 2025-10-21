const express = require('express');
const {
  getCategories,
  getCategoryById,
  getSubcategoriesByCategory,
  getSubcategoryById
} = require('../controllers/categoryController.js');

const router = express.Router();

// 获取所有分类
router.get('/', getCategories);

// 获取单个分类详情
router.get('/:id', getCategoryById);

// 获取分类下的子分类列表
router.get('/:categoryId/subcategories', getSubcategoriesByCategory);

// 获取单个子分类详情
router.get('/subcategories/:id', getSubcategoryById);

module.exports = router;