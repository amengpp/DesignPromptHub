# 数据库设计文档

## 数据库选择
- **数据库**: MySQL 8.0+
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci

## 数据表设计

### 1. users (用户表)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 2. categories (分类表)
```sql
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY, -- 如: 'web-app', 'mobile-app', 'web-website'
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. subcategories (子分类表)
```sql
CREATE TABLE subcategories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

### 4. prompts (提示词表)
```sql
CREATE TABLE prompts (
    id VARCHAR(50) PRIMARY KEY, -- 如: 'prompt-1', 'prompt-2'
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    subcategory_id VARCHAR(50) NOT NULL,
    tags JSON, -- 存储标签数组
    usage_count INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    is_public BOOLEAN DEFAULT TRUE,
    created_by INT,
    image_url VARCHAR(255), -- 提示词对应生成的图片存储地址
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 5. user_prompts (用户提示词关系表)
```sql
CREATE TABLE user_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    prompt_id VARCHAR(50) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    user_rating DECIMAL(2,1) CHECK (user_rating >= 0 AND user_rating <= 5),
    user_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_prompt (user_id, prompt_id)
);
```

### 6. prompt_ratings (提示词评分表)
```sql
CREATE TABLE prompt_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    prompt_id VARCHAR(50) NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_prompt_rating (user_id, prompt_id)
);
```

## 索引设计

### 用户表索引
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 提示词表索引
```sql
CREATE INDEX idx_prompts_category ON prompts(category_id);
CREATE INDEX idx_prompts_subcategory ON prompts(subcategory_id);
CREATE INDEX idx_prompts_usage_count ON prompts(usage_count);
CREATE INDEX idx_prompts_average_rating ON prompts(average_rating);
CREATE INDEX idx_prompts_created_at ON prompts(created_at);
CREATE FULLTEXT INDEX idx_prompts_search ON prompts(title, content);
```

### 关系表索引
```sql
CREATE INDEX idx_user_prompts_user ON user_prompts(user_id);
CREATE INDEX idx_user_prompts_prompt ON user_prompts(prompt_id);
CREATE INDEX idx_user_prompts_favorite ON user_prompts(is_favorite);
```

## 初始数据导入

基于现有的JSON数据文件，需要导入以下数据：

1. **categories表**: 从 categories.json 导入
2. **subcategories表**: 从 mobile-app-subcategories.json, web-app-subcategories.json, web-website-subcategories.json 导入
3. **prompts表**: 从 mobile-app-prompts.json, web-app-prompts.json, web-website-prompts.json 导入

## 数据库配置

### 连接配置
```javascript
{
  host: 'localhost',
  port: 3306,
  username: 'prompt_user',
  password: 'secure_password',
  database: 'design_prompt_hub',
  dialect: 'mysql',
  timezone: '+08:00', // 根据实际时区调整
  logging: process.env.NODE_ENV === 'development' ? console.log : false
}
```

### 连接池配置
```javascript
{
  max: 10,
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

## 数据迁移策略

1. 使用 Sequelize migrations 管理数据库变更
2. 每个功能模块对应独立的迁移文件
3. 开发环境使用自动同步，生产环境使用手动迁移
4. 定期备份重要数据

## 性能优化考虑

1. **查询优化**: 合理使用索引，避免全表扫描
2. **分页查询**: 大数据量时使用游标分页
3. **缓存策略**: 热点数据使用Redis缓存
4. **连接管理**: 使用连接池避免频繁连接创建