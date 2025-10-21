# API接口设计文档

## API基础信息

- **基础URL**: `/api/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2025-10-21T10:00:00Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": ["用户名不能为空"]
  },
  "timestamp": "2025-10-21T10:00:00Z"
}
```

## 认证相关接口

### POST /auth/register - 用户注册
**请求体**:
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "displayName": "用户昵称"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "displayName": "用户昵称"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login - 用户登录
**请求体**:
```json
{
  "username": "user123",
  "password": "password123"
}
```

### GET /auth/me - 获取当前用户信息
**Headers**: `Authorization: Bearer {token}`

## 分类相关接口

### GET /categories - 获取所有分类
**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "web-app",
      "name": "Web应用业务系统",
      "type": "Web应用",
      "description": "面向企业级Web应用系统的UI设计提示词",
      "count": 30,
      "subcategories": [
        {
          "id": "business-system",
          "name": "业务系统",
          "description": "企业级业务管理系统"
        }
      ]
    }
  ]
}
```

### GET /categories/:id/subcategories - 获取分类下的子分类

## 提示词相关接口

### GET /prompts - 获取提示词列表
**查询参数**:
- `category` (可选): 分类ID
- `subcategory` (可选): 子分类ID
- `search` (可选): 搜索关键词
- `tags` (可选): 标签筛选，逗号分隔
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认20
- `sort` (可选): 排序字段，如 `usage_count`, `average_rating`, `created_at`
- `order` (可选): 排序方向，`asc` 或 `desc`

**响应**:
```json
{
  "success": true,
  "data": {
    "prompts": [
      {
        "id": "prompt-1",
        "title": "即时通讯App主界面UI/UX设计提示词",
        "category": "mobile-app",
        "subcategory": "social-communication",
        "content": "**一、整体布局框架**...",
        "tags": ["设计提示词", "即时通讯", "主界面", "移动端"],
        "usageCount": 150,
        "averageRating": 4.5,
        "createdAt": "2025-10-14T10:00:00Z",
        "isFavorite": false,
        "userRating": 4.0
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 105,
      "totalPages": 6
    }
  }
}
```

### GET /prompts/:id - 获取提示词详情
**响应**:
```json
{
  "success": true,
  "data": {
    "prompt": {
      "id": "prompt-1",
      "title": "即时通讯App主界面UI/UX设计提示词",
      "category": {
        "id": "mobile-app",
        "name": "移动App"
      },
      "subcategory": {
        "id": "social-communication",
        "name": "社交通讯类"
      },
      "content": "**一、整体布局框架**...",
      "tags": ["设计提示词", "即时通讯", "主界面", "移动端"],
      "usageCount": 150,
      "averageRating": 4.5,
      "createdAt": "2025-10-14T10:00:00Z",
      "ratings": [
        {
          "user": {
            "displayName": "用户A"
          },
          "rating": 5,
          "comment": "非常实用的提示词",
          "createdAt": "2025-10-15T08:30:00Z"
        }
      ]
    }
  }
}
```

### POST /prompts - 创建新提示词
**Headers**: `Authorization: Bearer {token}`

**请求体**:
```json
{
  "title": "新的提示词标题",
  "content": "提示词详细内容",
  "categoryId": "mobile-app",
  "subcategoryId": "social-communication",
  "tags": ["新标签1", "新标签2"]
}
```

### PUT /prompts/:id - 更新提示词
**Headers**: `Authorization: Bearer {token}`

### DELETE /prompts/:id - 删除提示词
**Headers**: `Authorization: Bearer {token}`

## 用户相关接口

### GET /users/me/prompts - 获取用户自己的提示词
**Headers**: `Authorization: Bearer {token}`

**查询参数**:
- `type` (可选): `created`(创建的), `favorites`(收藏的)
- `page`, `limit`, `sort`, `order`

### POST /users/me/prompts/:id/favorite - 收藏/取消收藏提示词
**Headers**: `Authorization: Bearer {token}`

**请求体**:
```json
{
  "isFavorite": true
}
```

### POST /users/me/prompts/:id/rating - 给提示词评分
**Headers**: `Authorization: Bearer {token}`

**请求体**:
```json
{
  "rating": 4.5,
  "comment": "很好的提示词"
}
```

## 搜索相关接口

### GET /search - 全局搜索
**查询参数**:
- `q` (必需): 搜索关键词
- `type` (可选): `prompts`(提示词), `categories`(分类), `all`(全部)
- `category` (可选): 分类筛选
- `tags` (可选): 标签筛选

**响应**:
```json
{
  "success": true,
  "data": {
    "prompts": [...],
    "categories": [...],
    "total": 25
  }
}
```

## 统计相关接口

### GET /stats/overview - 获取平台统计概览
**响应**:
```json
{
  "success": true,
  "data": {
    "totalPrompts": 105,
    "totalUsers": 250,
    "totalCategories": 3,
    "todayNewPrompts": 5,
    "popularCategories": [
      {
        "id": "mobile-app",
        "name": "移动App",
        "promptCount": 45,
        "usageCount": 1200
      }
    ]
  }
}
```

## 错误码定义

| 错误码 | 描述 | HTTP状态码 |
|--------|------|------------|
| `VALIDATION_ERROR` | 参数验证失败 | 400 |
| `UNAUTHORIZED` | 未授权访问 | 401 |
| `FORBIDDEN` | 权限不足 | 403 |
| `NOT_FOUND` | 资源不存在 | 404 |
| `USER_EXISTS` | 用户已存在 | 409 |
| `INTERNAL_ERROR` | 服务器内部错误 | 500 |

## 接口测试用例

每个接口都需要编写对应的测试用例，包括：
- 正常情况测试
- 边界情况测试
- 错误情况测试
- 权限验证测试

## 版本管理

- 当前版本: v1
- 版本前缀: `/api/v1`
- 向后兼容性: 保证接口向后兼容
- 弃用策略: 提前通知，提供迁移方案