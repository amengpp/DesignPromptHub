const { sequelize } = require('../src/config/database.js');

// 测试前的全局设置
beforeAll(async () => {
  // 确保数据库连接正常
  try {
    await sequelize.authenticate();
    console.log('✅ 测试数据库连接成功');
  } catch (error) {
    console.error('❌ 测试数据库连接失败:', error);
    throw error;
  }
});

// 测试后的清理
afterAll(async () => {
  await sequelize.close();
});