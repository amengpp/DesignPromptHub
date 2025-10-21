const { sequelize } = require('../config/database.js');

// 导入所有模型
const User = require('./User.js');
const Category = require('./Category.js');
const Subcategory = require('./Subcategory.js');
const Prompt = require('./Prompt.js');

// 定义模型关联关系
const models = {
  User,
  Category,
  Subcategory,
  Prompt
};

// 建立关联关系
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};