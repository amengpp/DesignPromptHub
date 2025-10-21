const { sequelize, User } = require('../src/models/index.js');

async function testUsers() {
  try {
    console.log('🔗 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('👤 查询用户数据...');
    const users = await User.findAll();
    
    console.log(`📊 找到 ${users.length} 个用户:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}, 角色: ${user.role}`);
    });

    // 检查是否存在admin和demo用户
    const adminUser = users.find(u => u.username === 'admin');
    const demoUser = users.find(u => u.username === 'demo');
    
    if (adminUser && demoUser) {
      console.log('✅ 验证成功: admin和demo用户都已成功创建！');
    } else {
      console.log('❌ 验证失败: 缺少必要用户');
      if (!adminUser) console.log('   - admin用户未找到');
      if (!demoUser) console.log('   - demo用户未找到');
    }

  } catch (error) {
    console.error('❌ 查询用户失败:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔒 数据库连接已关闭');
  }
}

testUsers();