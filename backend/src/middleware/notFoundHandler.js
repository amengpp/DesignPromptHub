// 404 未找到路由处理中间件
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${req.method} ${req.path} 不存在`
    }
  });
};

module.exports = notFoundHandler;