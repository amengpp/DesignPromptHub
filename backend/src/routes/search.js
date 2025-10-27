const express = require('express');
const {
  globalSearch,
  getSearchSuggestions,
  getPopularSearches,
  advancedFilter
} = require('../controllers/searchController.js');
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

// 全局搜索
router.get('/', globalSearch);

// 搜索建议
router.get('/suggestions', getSearchSuggestions);

// 热门搜索
router.get('/popular', getPopularSearches);

// 高级筛选
router.get('/advanced', advancedFilter);

module.exports = router;