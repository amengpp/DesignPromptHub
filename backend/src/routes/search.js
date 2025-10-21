const express = require('express');
const {
  globalSearch,
  getSearchSuggestions,
  getPopularSearches,
  advancedFilter
} = require('../controllers/searchController.js');

const router = express.Router();

// 全局搜索
router.get('/', globalSearch);

// 搜索建议
router.get('/suggestions', getSearchSuggestions);

// 热门搜索
router.get('/popular', getPopularSearches);

// 高级筛选
router.get('/advanced', advancedFilter);

module.exports = router;