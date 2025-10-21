const Category = require('../models/Category.js');
const Subcategory = require('../models/Subcategory.js');

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

    const category = await Category.findByPk(id, {
      include: [{
        model: Subcategory,
        as: 'subcategories',
        attributes: ['id', 'name', 'description'],
        order: [['sortOrder', 'ASC']]
      }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: '分类不存在'
        }
      });
    }

    res.json({
      success: true,
      data: category,
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