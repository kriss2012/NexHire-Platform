import request from 'supertest';
import { createApp } from '../../src/app';
import { seedDatabase } from '../../src/db/seed';

describe('Auth API Integration Tests', () => {
  const app = createApp();

  beforeAll(async () => {
    await seedDatabase();
  });

  it('POST /api/auth/login should return JWT token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@jobboard.io',
        password: 'Admin123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@jobboard.io');
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('POST /api/auth/login should return 401 for incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@jobboard.io',
        password: 'IncorrectPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return 401 without Bearer token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me should return user profile with valid Bearer token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@jobboard.io',
        password: 'Admin123!',
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('admin@jobboard.io');
    expect(meRes.body.data.user.role).toBe('ADMIN');
  });

  it('POST /api/auth/logout should return 200 success', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
