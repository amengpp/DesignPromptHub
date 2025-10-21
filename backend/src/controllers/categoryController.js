const Category = require('../models/Category.js');
const Subcategory = require('../models/Subcategory.js');
const Prompt = require('../models/Prompt.js');
const User = require('../models/User.js');
const { Op, Sequelize } = require('sequelize');

// 获取所有分类及其子分类
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{
        model: Subcategory,
        as: 'subcategories',
        attributes: ['id', 'name', 'description']
      }],
      order: [['sortOrder', 'ASC']]
    });
    
    // 统计每个分类的提示词数量
    for (const category of categories) {
      const promptCount = await Prompt.count({
        where: { categoryId: category.id, isPublic: true }
      });
      category.dataValues.promptCount = promptCount;
    }

    res.json({
      success: true,
      data: categories,
      message: '获取分类列表成功'
    });

  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 获取单个分类详情
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取分类信息
    const categoryData = await Category.findByPk(id, {
      attributes: ['id', 'name', 'description', 'type', 'sortOrder']
    });
    
    if (!categoryData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: '分类不存在'
        }
      });
    }
    
    // 获取子分类
    const subcategories = await Subcategory.findAll({
      where: { categoryId: id },
      attributes: ['id', 'name', 'description', 'sortOrder'],
      order: [['sortOrder', 'ASC']]
    });
    
    // 获取分类下的提示词
    const prompts = await Prompt.findAll({
      where: { categoryId: id, isPublic: true },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'displayName']
        }
      ]
    });
    
    // 统计分类提示词数量
    const promptCount = await Prompt.count({
      where: { categoryId: id, isPublic: true }
    });
    categoryData.dataValues.promptCount = promptCount;
    
    // 为每个子分类添加提示词数量
    for (const subcategory of subcategories) {
      const subPromptCount = await Prompt.count({
        where: { subcategoryId: subcategory.id, isPublic: true }
      });
      subcategory.dataValues.promptCount = subPromptCount;
    }

    res.json({
      success: true,
      data: {
        category: categoryData,
        subcategories: subcategories,
        prompts: prompts
      },
      message: '获取分类详情成功'
    });

  } catch (error) {
    console.error('获取分类详情错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 获取分类下的子分类列表
const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // 验证分类是否存在
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: '分类不存在'
        }
      });
    }

    const subcategories = await Subcategory.findAll({
      where: { categoryId },
      order: [['sortOrder', 'ASC']]
    });

    res.json({
      success: true,
      data: subcategories,
      message: '获取子分类列表成功'
    });

  } catch (error) {
    console.error('获取子分类列表错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 获取单个子分类详情
const getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'type']
      }]
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBCATEGORY_NOT_FOUND',
          message: '子分类不存在'
        }
      });
    }

    res.json({
      success: true,
      data: subcategory,
      message: '获取子分类详情成功'
    });

  } catch (error) {
    console.error('获取子分类详情错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getSubcategoriesByCategory,
  getSubcategoryById
};