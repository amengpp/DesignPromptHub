const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Prompt = sequelize.define('Prompt', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'category_id'
  },
  subcategoryId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'subcategory_id'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'usage_count'
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    field: 'average_rating'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by'
  }
}, {
  tableName: 'prompts',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['category_id']
    },
    {
      fields: ['subcategory_id']
    },
    {
      fields: ['usage_count']
    },
    {
      fields: ['average_rating']
    },
    {
      fields: ['created_at']
    }
  ]
});

// 定义关联关系
Prompt.associate = function(models) {
  Prompt.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });
  
  Prompt.belongsTo(models.Subcategory, {
    foreignKey: 'subcategoryId',
    as: 'subcategory'
  });
  
  Prompt.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
};

module.exports = Prompt;