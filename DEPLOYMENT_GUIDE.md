# Vercel 部署指南

本文档提供了如何将 DesignPromptHub 应用部署到 Vercel 平台的详细步骤。

## 准备工作

1. 确保您已经在 [Vercel](https://vercel.com) 注册了账号
2. 确保您的项目代码已经提交到 GitHub/GitLab/Bitbucket 仓库
3. 准备好数据库连接信息（需要一个可从外部访问的 MySQL 数据库）

## 后端部署

### 步骤 1: 导入项目

1. 登录 Vercel 控制台
2. 点击右上角的 **New Project**
3. 从 Git 仓库列表中选择您的项目
4. 在项目配置页面，向下滚动找到**Root Directory**（根目录）选项
5. 在输入框中输入 `backend`

如果找不到Root Directory选项，请在导入项目后点击**Configure Project**按钮，然后在项目设置页面中查找该选项。

### 步骤 2: 配置环境变量

在部署设置页面，添加以下环境变量：

| 环境变量名 | 值 | 说明 |
|---------|-----|------|
| DB_HOST | your-database-host | 数据库主机地址 |
| DB_USERNAME | your-database-username | 数据库用户名 |
| DB_PASSWORD | your-database-password | 数据库密码 |
| DB_NAME | your-database-name | 数据库名称 |
| DB_PORT | 3306 | 数据库端口 |
| JWT_SECRET | your-production-secret-key | JWT 签名密钥 |
| JWT_EXPIRES_IN | 7d | JWT 过期时间 |
| PORT | 8000 | 服务器端口 |
| NODE_ENV | production | 运行环境 |
| FRONTEND_URL | https://your-frontend-domain.vercel.app | 前端部署后的 URL |

### 步骤 3: 部署配置

- Framework Preset: **Other**
- Build Command: `npm install`
- Output Directory: 留空
- Development Command: 留空

### 步骤 4: 部署项目

点击 **Deploy** 按钮开始部署。部署完成后，您将获得一个后端 API 的 URL。

## 前端部署

### 步骤 1: 导入项目

1. 再次点击 **New Project**
2. 从同一 Git 仓库列表中选择您的项目
3. 在项目配置页面，向下滚动找到**Root Directory**（根目录）选项
4. 在输入框中输入 `frontend`

如果找不到Root Directory选项，请在导入项目后点击**Configure Project**按钮，然后在项目设置页面中查找该选项。

### 步骤 2: 配置环境变量

添加以下环境变量：

| 环境变量名 | 值 |
|---------|-----|
| VITE_API_BASE_URL | https://your-backend-vercel-app.vercel.app/api/v1 |
| VITE_APP_NAME | Prompt提示词管理平台 |
| VITE_APP_VERSION | 1.0.0 |

### 步骤 3: 部署配置

- Framework Preset: **Vite**
- Build Command: `npm install && npm run build`
- Output Directory: `dist`
- Development Command: 留空

### 步骤 4: 部署项目

点击 **Deploy** 按钮开始部署。

## 更新配置

1. 部署完成后，复制前端的 URL
2. 返回后端项目的设置页面，更新 `FRONTEND_URL` 环境变量为前端的 URL
3. 重新部署后端项目

## 常见问题

### 数据库连接错误

- 确保数据库允许外部连接
- 检查环境变量配置是否正确
- 确认数据库服务是否正常运行

### CORS 错误

- 确保后端的 `FRONTEND_URL` 环境变量设置正确
- 检查前端的 `VITE_API_BASE_URL` 是否指向正确的后端 URL

### 部署失败

- 检查构建日志中的错误信息
- 确保所有依赖项在 `package.json` 中正确声明
- 验证 Vercel 配置文件 (`vercel.json`) 是否正确

## 注意事项

1. Vercel 的免费计划有请求限制和服务器less函数冷启动时间
2. 生产环境中请务必使用强密码作为 JWT_SECRET
3. 定期备份数据库数据
4. 监控应用性能和错误日志

## 部署后验证

部署完成后，可以通过以下方式验证应用是否正常运行：

1. 访问前端 URL，检查页面是否正常加载
2. 测试 API 连接：访问 `https://your-backend-url.vercel.app/health`
3. 尝试注册账号并创建提示词，验证完整功能