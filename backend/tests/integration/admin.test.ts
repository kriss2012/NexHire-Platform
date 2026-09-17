import request from 'supertest';
import { createApp } from '../../src/app';
import { seedDatabase } from '../../src/db/seed';

describe('Admin API Integration Tests', () => {
  const app = createApp();
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await seedDatabase();

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@jobboard.io',
      password: 'Admin123!',
    });
    adminToken = adminLogin.body.data.token;

    const userLogin = await request(app).post('/api/auth/login').send({
      email: 'alex.dev@cloud.io',
      password: 'Applicant123!',
    });
    userToken = userLogin.body.data.token;
  });

  it('GET /api/admin/stats should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/stats should reject non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/stats should return system telemetry for admin', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.totalUsers).toBeGreaterThanOrEqual(1);
    expect(res.body.data.stats.databaseStatus).toBeDefined();
  });

  it('GET /api/admin/users should return registered users for admin', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.users[0].password_hash).toBeUndefined(); // never expose password hashes
  });
});
