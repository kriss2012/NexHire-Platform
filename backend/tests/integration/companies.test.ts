import request from 'supertest';
import { createApp } from '../../src/app';
import { seedDatabase } from '../../src/db/seed';

describe('Companies API Integration Tests', () => {
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

  it('GET /api/companies should return list of companies', async () => {
    const res = await request(app).get('/api/companies');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.companies)).toBe(true);
    expect(res.body.data.companies.length).toBeGreaterThan(0);
  });

  it('GET /api/companies/:id should return single company details', async () => {
    const listRes = await request(app).get('/api/companies');
    const firstCompanyId = listRes.body.data.companies[0].id;

    const res = await request(app).get(`/api/companies/${firstCompanyId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.company.id).toBe(firstCompanyId);
  });

  it('POST /api/companies should reject unauthenticated users', async () => {
    const res = await request(app).post('/api/companies').send({
      name: 'Unauth Co',
      description: 'Test',
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/companies should reject regular candidates', async () => {
    const res = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Candidate Co',
        description: 'Should fail',
      });
    expect(res.status).toBe(403);
  });

  it('POST /api/companies should allow ADMIN to create a company', async () => {
    const res = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Enterprise Cloud Labs',
        description: 'Pioneering Kubernetes & Cloud-Native Platforms.',
        website: 'https://enterprise-cloud.io',
        location: 'Seattle, WA',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.company.name).toBe('Enterprise Cloud Labs');
  });

  it('PUT /api/companies/:id should allow ADMIN to update a company', async () => {
    const listRes = await request(app).get('/api/companies');
    const companyId = listRes.body.data.companies[0].id;

    const res = await request(app)
      .put(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Company Name',
        description: 'Updated description for testing.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.company.name).toBe('Updated Company Name');
  });
});
