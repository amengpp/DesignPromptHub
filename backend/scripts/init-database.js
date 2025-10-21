const { sequelize, Category, Subcategory, Prompt, User } = require('../src/models/index.js');

// 导入现有数据
const categoriesData = require('../../data/categories.json');
const mobileAppSubcategories = require('../../data/mobile-app-subcategories.json');
const webAppSubcategories = require('../../data/web-app-subcategories.json');
const webWebsiteSubcategories = require('../../data/web-website-subcategories.json');

const mobileAppPrompts = require('../../data/mobile-app-prompts.json');
const webAppPrompts = require('../../data/web-app-prompts.json');
const webWebsitePrompts = require('../../data/web-website-prompts.json');

async function initializeDatabase() {
  try {
    console.log('🔗 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('🗃️ 同步数据库表结构...');
    await sequelize.sync({ force: true });
    console.log('✅ 数据库表结构同步完成');

    console.log('📊 导入分类数据...');
    await Category.bulkCreate(categoriesData);
    console.log('✅ 分类数据导入完成');

    console.log('📊 导入子分类数据...');
    const allSubcategories = [
      ...mobileAppSubcategories,
      ...webAppSubcategories,
      ...webWebsiteSubcategories
    ];
    
    // 分批导入子分类数据，避免内存问题
    const batchSize = 10;
    for (let i = 0; i < allSubcategories.length; i += batchSize) {
      const batch = allSubcategories.slice(i, i + batchSize);
      await Subcategory.bulkCreate(batch);
      console.log(`  导入子分类批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(allSubcategories.length / batchSize)}`);
    }
    console.log('✅ 子分类数据导入完成');

    console.log('👤 导入用户数据...');
    try {
      await User.create({
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password: 'hashed_password',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ 默认用户创建成功');
    } catch (err) {
      console.error('❌ 用户创建失败:', err.message);
    }

    console.log('📊 导入提示词数据...');
    const allPrompts = [
      ...mobileAppPrompts,
      ...webAppPrompts,
      ...webWebsitePrompts
    ];
    
    console.log(`   总提示词数量: ${allPrompts.length}`);
    
    // 处理提示词数据，确保格式正确并映射字段名
    const processedPrompts = allPrompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      categoryId: prompt.category,  // 映射 category -> categoryId
      subcategoryId: prompt.subcategory,  // 映射 subcategory -> subcategoryId
      tags: Array.isArray(prompt.tags) ? prompt.tags : [],
      usageCount: prompt.usageCount || 0,
      averageRating: prompt.averageRating || 0.00,
      isPublic: prompt.isPublic !== undefined ? prompt.isPublic : true,
      createdBy: 1, // 设置默认用户ID
      createdAt: prompt.createdAt || new Date(),
      updatedAt: prompt.updatedAt || new Date()
    }));
    
    console.log(`   处理后提示词数量: ${processedPrompts.length}`);
    if (processedPrompts.length > 0) {
      console.log('   第一个提示词示例:', JSON.stringify(processedPrompts[0], null, 2).substring(0, 200) + '...');
    }
    
    // 分批导入提示词数据，避免内存问题
    let importedCount = 0;
    
    // 禁用外键约束检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (let i = 0; i < processedPrompts.length; i += batchSize) {
      const batch = processedPrompts.slice(i, i + batchSize);
      try {
        const result = await Prompt.bulkCreate(batch, { validate: false, ignoreDuplicates: true });
        importedCount += result.length;
        console.log(`  导入提示词批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(processedPrompts.length / batchSize)} - 成功导入 ${result.length} 条`);
      } catch (err) {
        console.error(`  导入批次 ${Math.floor(i / batchSize) + 1} 失败:`, err.message);
        // 尝试单独导入每一条记录
        for (const p of batch) {
          try {
            await Prompt.create(p, { validate: false });
            importedCount++;
          } catch (e) {
            console.error(`    单条导入失败 (${p.id}):`, e.message);
          }
        }
      }
    }
    
    // 重新启用外键约束检查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log(`   成功导入提示词总数: ${importedCount}`);
    console.log('✅ 提示词数据导入完成');

    console.log('🎉 数据库初始化完成！');
    console.log(`📈 导入统计：`);
    console.log(`   - 分类: ${categoriesData.length} 个`);
    console.log(`   - 子分类: ${allSubcategories.length} 个`);
    console.log(`   - 提示词总数量: ${allPrompts.length} 个`);
    console.log(`   - 成功导入提示词: ${importedCount} 个`);

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔒 数据库连接已关闭');
  }
}

// 如果是直接运行此脚本
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;