const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  iconUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'icon_url'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true
});

// 定义关联关系
Category.associate = function(models) {
  Category.hasMany(models.Subcategory, {
    foreignKey: 'categoryId',
    as: 'subcategories'
  });
  
  Category.hasMany(models.Prompt, {
    foreignKey: 'categoryId',
    as: 'prompts'
  });
};

module.exports = Category;