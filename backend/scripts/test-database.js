const { sequelize, Category, Subcategory, Prompt, User } = require('../src/models/index.js');

async function testDatabase() {
  try {
    console.log('🔗 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    console.log('🗃️ 测试表结构同步...');
    await sequelize.sync({ force: true });
    console.log('✅ 表结构同步成功');

    console.log('📊 测试创建分类...');
    const category = await Category.create({
      id: 'test-category',
      name: '测试分类',
      type: '测试类型',
      description: '这是一个测试分类'
    });
    console.log('✅ 分类创建成功:', category.toJSON());

    console.log('📊 测试创建子分类...');
    const subcategory = await Subcategory.create({
      id: 'test-subcategory',
      name: '测试子分类',
      categoryId: 'test-category',
      description: '这是一个测试子分类'
    });
    console.log('✅ 子分类创建成功:', subcategory.toJSON());

    console.log('📊 测试创建提示词...');
    const prompt = await Prompt.create({
      id: 'test-prompt',
      title: '测试提示词',
      content: '这是一个测试提示词内容',
      categoryId: 'test-category',
      subcategoryId: 'test-subcategory',
      tags: ['测试', '提示词']
    });
    console.log('✅ 提示词创建成功:', prompt.toJSON());

    console.log('📊 测试查询数据...');
    const categories = await Category.findAll({
      include: [{
        model: Subcategory,
        as: 'subcategories'
      }]
    });
    console.log('✅ 数据查询成功:', JSON.stringify(categories, null, 2));

    console.log('🎉 数据库测试完成！所有功能正常');

  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 数据库连接已关闭');
  }
}

testDatabase();