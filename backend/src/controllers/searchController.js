const { Op } = require('sequelize');
const Prompt = require('../models/Prompt.js');
const Category = require('../models/Category.js');
const Subcategory = require('../models/Subcategory.js');
const User = require('../models/User.js');

// 全局搜索
const globalSearch = async (req, res) => {
  try {
    const { q, type = 'all', category, tags, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SEARCH_QUERY_REQUIRED',
          message: '搜索关键词不能为空'
        }
      });
    }

    const searchTypes = type.split(',');
    const results = {};
    let totalCount = 0;

    // 搜索提示词
    if (searchTypes.includes('all') || searchTypes.includes('prompts')) {
      const where = {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { content: { [Op.like]: `%${q}%` } },
          { tags: { [Op.overlap]: [q] } }
        ]
      };

      if (category) {
        where.categoryId = category;
      }

      if (tags) {
        const tagArray = tags.split(',');
        where.tags = { [Op.overlap]: tagArray };
      }

      const { count, rows: prompts } = await Prompt.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'type']
          },
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
        ],
        order: [['usageCount', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      results.prompts = prompts;
      totalCount += count;
    }

    // 搜索分类
    if (searchTypes.includes('all') || searchTypes.includes('categories')) {
      const categories = await Category.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { type: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        },
        include: [{
          model: Subcategory,
          as: 'subcategories',
          attributes: ['id', 'name']
        }],
        limit: 10
      });

      results.categories = categories;
      totalCount += categories.length;
    }

    // 搜索子分类
    if (searchTypes.includes('all') || searchTypes.includes('subcategories')) {
      const subcategories = await Subcategory.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type']
        }],
        limit: 10
      });

      results.subcategories = subcategories;
      totalCount += subcategories.length;
    }

    res.json({
      success: true,
      data: {
        ...results,
        total: totalCount,
        query: q,
        searchTypes
      },
      message: '搜索完成'
    });

  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 热门搜索建议
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({
        success: true,
        data: { suggestions: [] },
        message: '请输入搜索关键词'
      });
    }

    // 从提示词标题中获取建议
    const promptSuggestions = await Prompt.findAll({
      where: {
        title: { [Op.like]: `%${q}%` }
      },
      attributes: ['title'],
      limit: 5,
      group: ['title']
    });

    // 从分类名称中获取建议
    const categorySuggestions = await Category.findAll({
      where: {
        name: { [Op.like]: `%${q}%` }
      },
      attributes: ['name'],
      limit: 3,
      group: ['name']
    });

    // 从标签中获取建议
    const tagSuggestions = await Prompt.findAll({
      where: {
        tags: { [Op.overlap]: [q] }
      },
      attributes: ['tags'],
      limit: 5
    });

    const suggestions = [
      ...promptSuggestions.map(p => ({ type: 'prompt', text: p.title })),
      ...categorySuggestions.map(c => ({ type: 'category', text: c.name })),
      ...tagSuggestions.flatMap(p => 
        p.tags.filter(tag => tag.includes(q)).map(tag => ({
          type: 'tag',
          text: tag
        }))
      )
    ].slice(0, 10); // 限制总建议数量

    res.json({
      success: true,
      data: { suggestions },
      message: '获取搜索建议成功'
    });

  } catch (error) {
    console.error('获取搜索建议错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 获取热门搜索关键词
const getPopularSearches = async (req, res) => {
  try {
    // 这里可以集成搜索统计功能，暂时返回固定热门关键词
    const popularSearches = [
      'UI设计', '移动端', 'Web应用', '用户体验', '界面设计',
      '即时通讯', '电商', '金融', '医疗', '教育'
    ];

    res.json({
      success: true,
      data: { popularSearches },
      message: '获取热门搜索成功'
    });

  } catch (error) {
    console.error('获取热门搜索错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 高级筛选
const advancedFilter = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      tags,
      minUsage = 0,
      minRating = 0,
      dateFrom,
      dateTo,
      sortBy = 'usageCount',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const where = {};

    if (category) {
      where.categoryId = category;
    }

    if (subcategory) {
      where.subcategoryId = subcategory;
    }

    if (tags) {
      const tagArray = tags.split(',');
      where.tags = { [Op.overlap]: tagArray };
    }

    if (minUsage > 0) {
      where.usageCount = { [Op.gte]: parseInt(minUsage) };
    }

    if (minRating > 0) {
      where.averageRating = { [Op.gte]: parseFloat(minRating) };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    const { count, rows: prompts } = await Prompt.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type']
        },
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
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        prompts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        filters: {
          category,
          subcategory,
          tags: tags ? tags.split(',') : [],
          minUsage: parseInt(minUsage),
          minRating: parseFloat(minRating),
          dateFrom,
          dateTo
        }
      },
      message: '高级筛选完成'
    });

  } catch (error) {
    console.error('高级筛选错误:', error);
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
  globalSearch,
  getSearchSuggestions,
  getPopularSearches,
  advancedFilter
};