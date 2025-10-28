// 显式导入mysql2以确保在Vercel环境中正确加载
const mysql2 = require('mysql2');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// 为Vercel无服务器环境配置优化的数据库连接
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'yt123456',
  database: process.env.DB_NAME || 'design_prompt_hub',
  timezone: '+08:00',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  // 无服务器环境优化配置
  pool: {
    max: 5, // 减少连接池大小
    min: 0,
    acquire: 10000, // 减少获取超时时间
    idle: 5000 // 减少空闲超时时间
    // 移除不支持的validate配置
  },
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  // 增加连接重试逻辑
  retry: {
    max: 3,
    timeout: 5000
  }
});

// 测试数据库连接（仅在需要时调用）
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 同步数据库（仅开发环境）
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ 数据库同步完成');
    }
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    // 在无服务器环境中不退出进程，让请求失败但允许后续请求重试
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// 按需连接数据库
const ensureConnection = async () => {
  try {
    // 使用更安全的方式检查连接状态，直接尝试验证连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接正常');
  } catch (error) {
    console.error('❌ 确保数据库连接失败:', error.message);
    throw error;
  }
};

module.exports = { sequelize, testConnection, ensureConnection };