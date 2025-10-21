const request = require('supertest');
const app = require('../src/app.js');
const { sequelize } = require('../src/config/database.js');
const User = require('../src/models/User.js');

// 测试数据
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  displayName: '测试用户'
};

const anotherUser = {
  username: 'anotheruser',
  email: 'another@example.com',
  password: 'password456',
  displayName: '另一个用户'
};

// 测试前准备
describe('用户认证模块测试', () => {
  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // 关闭数据库连接
    await sequelize.close();
  });

  beforeEach(async () => {
    // 清空用户表
    await User.destroy({ where: {} });
  });

  describe('POST /api/v1/auth/register - 用户注册', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.displayName).toBe(testUser.displayName);
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data).toHaveProperty('token');
    });

    it('应该验证用户名格式', async () => {
      const invalidUser = { ...testUser, username: 'ab' }; // 太短
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('应该拒绝重复的用户名', async () => {
      // 先注册一个用户
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      // 尝试用相同的用户名注册
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...anotherUser, username: testUser.username })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_EXISTS');
    });

    it('应该拒绝重复的邮箱', async () => {
      // 先注册一个用户
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      // 尝试用相同的邮箱注册
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...anotherUser, email: testUser.email })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('应该验证密码长度', async () => {
      const invalidUser = { ...testUser, password: '123' }; // 太短
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login - 用户登录', () => {
    beforeEach(async () => {
      // 注册测试用户
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
    });

    it('应该使用用户名成功登录', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data).toHaveProperty('token');
    });

    it('应该使用邮箱成功登录', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: testUser.email, // 使用邮箱作为用户名
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data).toHaveProperty('token');
    });

    it('应该拒绝错误的密码', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('应该拒绝不存在的用户', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/auth/me - 获取当前用户信息', () => {
    let authToken;

    beforeEach(async () => {
      // 注册并登录用户
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      authToken = registerResponse.body.data.token;
    });

    it('应该返回认证用户的信息', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('应该拒绝无效的令牌', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('应该拒绝缺少令牌的请求', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/v1/auth/profile - 更新用户信息', () => {
    let authToken;

    beforeEach(async () => {
      // 注册并登录用户
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      authToken = registerResponse.body.data.token;
    });

    it('应该成功更新用户信息', async () => {
      const updateData = {
        displayName: '新的显示名称',
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.displayName).toBe(updateData.displayName);
      expect(response.body.data.user.avatarUrl).toBe(updateData.avatarUrl);
    });

    it('应该验证更新数据的格式', async () => {
      const invalidData = {
        displayName: 'a'.repeat(101), // 超过长度限制
        avatarUrl: 'not-a-valid-url'
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});