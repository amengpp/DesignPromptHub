const express = require('express');
const router = express.Router();

// 临时路由 - 后续实现具体功能
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: '用户功能开发中'
  });
});

module.exports = router;