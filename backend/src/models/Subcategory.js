const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Subcategory = sequelize.define('Subcategory', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  categoryId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'category_id'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  }
}, {
  tableName: 'subcategories',
  timestamps: true,
  underscored: true
});

// 定义关联关系
Subcategory.associate = function(models) {
  Subcategory.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });
  
  Subcategory.hasMany(models.Prompt, {
    foreignKey: 'subcategoryId',
    as: 'prompts'
  });
};

module.exports = Subcategory;