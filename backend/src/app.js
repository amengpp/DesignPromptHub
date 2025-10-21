const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// 导入路由
const authRoutes = require('./routes/auth.js');
const categoryRoutes = require('./routes/categories.js');
const promptRoutes = require('./routes/prompts.js');
const userRoutes = require('./routes/users.js');
const searchRoutes = require('./routes/search.js');

// 导入中间件
const errorHandler = require('./middleware/errorHandler.js');
const notFoundHandler = require('./middleware/notFoundHandler.js');

// 加载环境变量
dotenv.config();

// 导入模型关联
require('./models/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());
app.use(compression());

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 请求限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP每15分钟最多100个请求
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '请求过于频繁，请稍后再试'
    }
  }
});
app.use(limiter);

// 日志中间件
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/prompts', promptRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/search', searchRoutes);

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 健康检查: http://localhost:${PORT}/health`);
  });
}

module.exports = app;