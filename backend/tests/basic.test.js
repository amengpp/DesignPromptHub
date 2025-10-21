const request = require('supertest');
const app = require('../src/app.js');

describe('基础功能测试', () => {
  it('健康检查端点应该正常工作', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('OK');
  });

  it('应该返回404对于不存在的路由', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});