# DesignPromptHub - Prompt提示词管理平台

## 项目概述

一个专注于AI提示词管理的Web应用，支持提示词的展示、查询、用户提交和修改功能。采用移动端优先的设计理念，兼顾Web端访问体验。

## 核心功能

### 1. 提示词展示与浏览
- **分类导航**: 按三大类别（Web应用业务系统、Web网站、移动App）和子分类展示
- **卡片式布局**: 美观的提示词卡片展示，包含标题、描述、标签等信息
- **瀑布流设计**: 移动端优化的滚动浏览体验

### 2. 智能搜索与筛选
- **关键词搜索**: 实时搜索提示词标题和内容
- **分类筛选**: 按类别、子分类、标签多维度筛选
- **热门推荐**: 展示热门和高评分提示词

### 3. 用户交互功能
- **提示词提交**: 用户可提交自定义提示词
- **个人中心**: 管理用户提交的提示词，支持编辑和删除
- **收藏功能**: 收藏喜欢的提示词到个人收藏夹

## 技术栈

### 前端
- Vue 3 + Composition API
- Vite 构建工具
- Tailwind CSS 样式框架
- Vue Router 4 路由管理
- Pinia 状态管理
- Axios HTTP客户端

### 后端
- Node.js + Express.js
- MySQL 数据库
- Sequelize ORM
- JWT 认证
- Joi 数据验证

### 测试框架
- 前端: Vitest + Vue Test Utils
- 后端: Jest + Supertest

## 项目结构

```
DesignPromptHub/
├── backend/                 # 后端代码
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── middleware/     # 中间件
│   │   └── utils/          # 工具函数
│   ├── tests/              # 后端测试
│   └── package.json
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/     # Vue组件
│   │   ├── views/          # 页面视图
│   │   ├── stores/         # 状态管理
│   │   ├── router/         # 路由配置
│   │   └── utils/          # 工具函数
│   ├── tests/              # 前端测试
│   └── package.json
├── data/                   # 现有数据文件
│   ├── categories.json
│   ├── mobile-app-*.json
│   ├── web-app-*.json
│   └── web-website-*.json
└── docs/                   # 项目文档
```

## 开发流程

1. **需求分析阶段** ✅
   - 分析现有数据结构
   - 确定功能需求
   - 制定技术方案

2. **架构设计阶段**
   - 数据库设计
   - API接口设计
   - 前端架构设计

3. **详细设计阶段**
   - 模块划分
   - 接口规范
   - 测试方案

4. **编码实现阶段**
   - 后端开发（先）
   - 前端开发（后）
   - 模块化测试驱动

## 数据模型

基于现有数据文件，设计以下核心数据表：

### Categories (分类表)
- id, name, type, description, count

### Subcategories (子分类表)  
- id, name, categoryId, description

### Prompts (提示词表)
- id, title, category, subcategory, content, tags, createdAt, updatedAt

### Users (用户表)
- id, username, email, password, createdAt

### UserPrompts (用户提示词关系表)
- id, userId, promptId, isFavorite, userRating, createdAt

## 开发规范

- 采用模块化开发，每个模块独立测试
- 前后端分离架构
- RESTful API设计
- 移动端优先的响应式设计
- 代码规范：ESLint + Prettier

## 启动说明

详细的环境配置和启动步骤将在后续开发阶段提供。