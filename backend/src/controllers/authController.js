const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { Op } = require('sequelize');
const User = require('../models/User.js');

// JWT令牌生成函数
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 注册验证模式
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  displayName: Joi.string().max(100).optional()
});

// 登录验证模式
const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required()
});

// 用户注册
const register = async (req, res) => {
  try {
    // 验证请求数据
    const { error, value } = registerSchema.validate(req.body);
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

    const { username, email, password, displayName } = value;

    // 检查用户名是否已存在
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: '用户名已存在'
        }
      });
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: '邮箱已存在'
        }
      });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      passwordHash: password, // 密码会在模型钩子中自动加密
      displayName: displayName || username
    });

    // 生成JWT令牌
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: '用户注册成功'
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    // 验证请求数据
    const { error, value } = loginSchema.validate(req.body);
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

    const { identifier, password } = value;

    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: identifier },
          { email: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: '账户已被禁用'
        }
      });
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      });
    }

    // 生成JWT令牌
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: '登录成功'
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

// 更新用户信息
const updateProfile = async (req, res) => {
  try {
    console.log('收到更新用户信息请求:', req.body);
    
    const updateSchema = Joi.object({
      displayName: Joi.string().max(100).optional(),
      email: Joi.string().email().optional(),
      avatarUrl: Joi.string().uri().optional()
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      console.log('参数验证失败:', error.details);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '参数验证失败',
          details: error.details.map(detail => detail.message)
        }
      });
    }

    console.log('验证通过，准备更新用户信息:', value);
    
    // 如果更新邮箱，检查是否与其他用户冲突
    if (value.email && value.email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email: value.email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: '邮箱已被其他用户使用'
          }
        });
      }
    }
    
    await req.user.update(value);
    console.log('用户信息更新成功:', req.user.id);

    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      },
      message: '用户信息更新成功'
    });

  } catch (error) {
    console.error('更新用户信息错误:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误',
        details: error.message
      }
    });
  }
};

// 用户登出
const logout = async (req, res) => {
  try {
    // 在JWT实现中，服务器端不需要特殊处理，只需通知客户端删除token
    // 这里可以添加额外的安全措施，如将token加入黑名单（如果需要实现token黑名单机制）
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
};

module.exports = { register, login, getCurrentUser, updateProfile, logout };