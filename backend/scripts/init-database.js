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
      // 创建管理员用户
      await User.create({
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: 'hashed_password', // 使用正确的字段名
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ 管理员用户创建成功');
      
      // 创建演示用户
      await User.create({
        id: 2,
        username: 'demo',
        email: 'demo@example.com',
        passwordHash: 'demo123', // 使用正确的字段名
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ 演示用户创建成功');
    } catch (err) {
      console.error('❌ 用户创建失败:', err.message);
    }

    console.log('📊 导入提示词数据...');
    
    console.log(`   原始数据统计:`);
    console.log(`     - 移动App提示词: ${mobileAppPrompts.length} 个`);
    console.log(`     - Web应用提示词: ${webAppPrompts.length} 个`);
    console.log(`     - Web网站提示词: ${webWebsitePrompts.length} 个`);
    
    // 为每个来源的提示词添加正确的category
    const mobileAppPromptsWithCategory = mobileAppPrompts.map(prompt => ({
      ...prompt,
      category: 'mobile-app', // 确保移动App提示词使用正确的分类
      id: `mobile-${prompt.id}` // 为移动App提示词添加前缀避免ID冲突
    }));
    
    const webAppPromptsWithCategory = webAppPrompts.map(prompt => ({
      ...prompt,
      category: 'web-app', // 修正Web应用提示词的分类
      id: `webapp-${prompt.id}` // 为Web应用提示词添加前缀避免ID冲突
    }));
    
    const webWebsitePromptsWithCategory = webWebsitePrompts.map(prompt => ({
      ...prompt,
      category: 'web-website', // 修正Web网站提示词的分类
      id: `website-${prompt.id}` // 为Web网站提示词添加前缀避免ID冲突
    }));
    
    const allPrompts = [
      ...mobileAppPromptsWithCategory,
      ...webAppPromptsWithCategory,
      ...webWebsitePromptsWithCategory
    ];
    
    console.log(`   总提示词数量: ${allPrompts.length}`);
    
    // 按分类分组统计
    const categoryStats = allPrompts.reduce((acc, prompt) => {
      acc[prompt.category] = (acc[prompt.category] || 0) + 1;
      return acc;
    }, {});
    console.log(`   按分类统计:`);
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`     - ${category}: ${count} 个`);
    });
    
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
    // 显示各类别处理后的示例
    const mobileExample = processedPrompts.find(p => p.categoryId === 'mobile-app');
    const webappExample = processedPrompts.find(p => p.categoryId === 'web-app');
    const websiteExample = processedPrompts.find(p => p.categoryId === 'web-website');
    
    if (mobileExample) console.log(`   移动App示例:`, { id: mobileExample.id, categoryId: mobileExample.categoryId, title: mobileExample.title.substring(0, 30) + '...' });
    if (webappExample) console.log(`   Web应用示例:`, { id: webappExample.id, categoryId: webappExample.categoryId, title: webappExample.title.substring(0, 30) + '...' });
    if (websiteExample) console.log(`   Web网站示例:`, { id: websiteExample.id, categoryId: websiteExample.categoryId, title: websiteExample.title.substring(0, 30) + '...' });
    
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