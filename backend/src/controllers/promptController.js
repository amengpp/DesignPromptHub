const { Op } = require('sequelize');
const Joi = require('joi');
const Prompt = require('../models/Prompt.js');
const Category = require('../models/Category.js');
const Subcategory = require('../models/Subcategory.js');

// 验证模式
const createPromptSchema = Joi.object({
  title: Joi.string().max(200).required(),
  content: Joi.string().required(),
  categoryId: Joi.string().max(50).required(),
  subcategoryId: Joi.string().max(50).required(),
  tags: Joi.array().items(Joi.string()).default([])
});

const updatePromptSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  content: Joi.string().optional(),
  categoryId: Joi.string().max(50).optional(),
  subcategoryId: Joi.string().max(50).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// 获取提示词列表
const getPrompts = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      search,
      tags,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // 构建查询条件
    const where = {};
    
    if (category) {
      where.categoryId = category;
    }
    
    if (subcategory) {
      where.subcategoryId = subcategory;
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (tags) {
      const tagArray = tags.split(',');
      where.tags = { [Op.overlap]: tagArray };
    }

    // 分页配置
    const offset = (page - 1) * limit;
    
    // 映射排序字段
    const sortMapping = {
      'newest': 'createdAt',
      'popular': 'usageCount',
      'title': 'title',
      'rating': 'averageRating'
    };
    
    const sortField = sortMapping[sort] || 'createdAt';
    
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
        }
      ],
      order: [[sortField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
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
        }
      },
      message: '获取提示词列表成功'
    });

  } catch (error) {
    console.error('获取提示词列表错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 获取提示词详情
const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = await Prompt.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'description']
        },
        {
          model: Subcategory,
          as: 'subcategory',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROMPT_NOT_FOUND',
          message: '提示词不存在'
        }
      });
    }

    // 增加使用次数
    await prompt.increment('usageCount');

    res.json({
      success: true,
      data: { prompt },
      message: '获取提示词详情成功'
    });

  } catch (error) {
    console.error('获取提示词详情错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 创建新提示词
const createPrompt = async (req, res) => {
  try {
    // 验证请求数据
    const { error, value } = createPromptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '参数验证失败',
          details: error.details.map(detail => detail.message)
        }
      });
    }

    const { title, content, categoryId, subcategoryId, tags } = value;

    // 验证分类和子分类是否存在
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: '分类不存在'
        }
      });
    }

    const subcategory = await Subcategory.findByPk(subcategoryId);
    if (!subcategory || subcategory.categoryId !== categoryId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SUBCATEGORY_NOT_FOUND',
          message: '子分类不存在或不属于该分类'
        }
      });
    }

    // 生成唯一ID
    const promptId = `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 创建提示词
    const prompt = await Prompt.create({
      id: promptId,
      title,
      content,
      categoryId,
      subcategoryId,
      tags: tags || [],
      createdBy: req.user ? req.user.id : null
    });

    res.status(201).json({
      success: true,
      data: { prompt },
      message: '提示词创建成功'
    });

  } catch (error) {
    console.error('创建提示词错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 更新提示词
const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证请求数据
    const { error, value } = updatePromptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '参数验证失败',
          details: error.details.map(detail => detail.message)
        }
      });
    }

    const prompt = await Prompt.findByPk(id);
    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROMPT_NOT_FOUND',
          message: '提示词不存在'
        }
      });
    }

    // 验证权限（只有创建者可以修改）
    if (req.user && prompt.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '没有权限修改此提示词'
        }
      });
    }

    // 更新提示词
    await prompt.update(value);

    res.json({
      success: true,
      data: { prompt },
      message: '提示词更新成功'
    });

  } catch (error) {
    console.error('更新提示词错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 删除提示词
const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = await Prompt.findByPk(id);
    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROMPT_NOT_FOUND',
          message: '提示词不存在'
        }
      });
    }

    // 验证权限（只有创建者可以删除）
    if (req.user && prompt.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '没有权限删除此提示词'
        }
      });
    }

    await prompt.destroy();

    res.json({
      success: true,
      message: '提示词删除成功'
    });

  } catch (error) {
    console.error('删除提示词错误:', error);
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
  getPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt
};