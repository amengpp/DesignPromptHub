const { sequelize, Category, Subcategory, Prompt } = require('../src/models/index.js');

async function verifyData() {
  try {
    console.log('🔗 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('📊 验证分类数据...');
    const categories = await Category.findAll({
      include: [{
        model: Subcategory,
        as: 'subcategories'
      }]
    });
    
    console.log(`✅ 找到 ${categories.length} 个分类`);
    categories.forEach(cat => {
      console.log(`   📁 ${cat.name} (${cat.id}) - ${cat.subcategories.length} 个子分类`);
    });

    console.log('📊 验证提示词数据...');
    const prompts = await Prompt.findAll({
      limit: 5,
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Subcategory,
          as: 'subcategory'
        }
      ]
    });
    
    console.log(`✅ 找到 ${await Prompt.count()} 个提示词`);
    console.log('📝 示例提示词:');
    prompts.forEach(prompt => {
      console.log(`   📄 ${prompt.title}`);
      console.log(`     分类: ${prompt.category?.name} -> ${prompt.subcategory?.name}`);
      console.log(`     标签: ${prompt.tags?.join(', ')}`);
      console.log(`     字数: ${prompt.content?.length} 字符`);
    });

    console.log('🎉 数据验证完成！');

  } catch (error) {
    console.error('❌ 数据验证失败:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 数据库连接已关闭');
  }
}

verifyData();