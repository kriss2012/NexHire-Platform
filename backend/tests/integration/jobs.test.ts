import request from 'supertest';
import { createApp } from '../../src/app';
import { seedDatabase } from '../../src/db/seed';

describe('Jobs & Application API Integration Tests', () => {
  const app = createApp();
  let adminToken: string;
  let applicantToken: string;

  beforeAll(async () => {
    await seedDatabase();

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@jobboard.io',
      password: 'Admin123!',
    });
    adminToken = adminLogin.body.data.token;

    const applicantLogin = await request(app).post('/api/auth/login').send({
      email: 'alex.dev@cloud.io',
      password: 'Applicant123!',
    });
    applicantToken = applicantLogin.body.data.token;
  });

  it('GET /api/jobs should return list of active jobs with pagination', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.jobs)).toBe(true);
    expect(res.body.data.jobs.length).toBeGreaterThan(0);
    expect(res.headers['x-cache']).toBeDefined();
  });

  it('GET /api/jobs with search query should filter relevant jobs', async () => {
    const res = await request(app).get('/api/jobs?q=Kubernetes');
    expect(res.status).toBe(200);
    expect(res.body.data.jobs.length).toBeGreaterThan(0);
    expect(res.body.data.jobs[0].title).toContain('Kubernetes');
  });

  it('GET /api/jobs/:id should return full job details', async () => {
    const listRes = await request(app).get('/api/jobs');
    const firstJobId = listRes.body.data.jobs[0].id;

    const res = await request(app).get(`/api/jobs/${firstJobId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.job.id).toBe(firstJobId);
    expect(res.body.data.job.title).toBeDefined();
  });

  it('POST /api/jobs should reject unauthenticated users', async () => {
    const res = await request(app).post('/api/jobs').send({
      company_id: 'cmp-001',
      title: 'Hacker Job',
      description: 'Unauthorized post',
      location: 'Nowhere',
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/jobs should reject normal USER role', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({
        company_id: 'cmp-001',
        title: 'Unauthorized Post',
        description: 'Should fail authorization',
        location: 'Remote',
      });
    expect(res.status).toBe(403);
  });

  it('POST /api/jobs should allow ADMIN to post a new job', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        company_id: 'cmp-001',
        title: 'Staff DevSecOps Lead',
        description: 'Lead DevSecOps practice across container and cluster architectures.',
        requirements: ['GitOps', 'ArgoCD', 'Trivy'],
        location: 'Remote, US',
        is_remote: true,
        type: 'FULL_TIME',
        salary_min: 190000,
        salary_max: 230000,
        salary_currency: 'USD',
        status: 'ACTIVE',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.job.title).toBe('Staff DevSecOps Lead');
  });

  it('POST /api/jobs/:id/save should allow applicant to save a job', async () => {
    const res = await request(app)
      .post('/api/jobs/job-003/save')
      .set('Authorization', `Bearer ${applicantToken}`);

    expect([200, 201]).toContain(res.status);

    const savedRes = await request(app)
      .get('/api/saved-jobs')
      .set('Authorization', `Bearer ${applicantToken}`);

    expect(savedRes.status).toBe(200);
    expect(savedRes.body.data.savedJobs.length).toBeGreaterThan(0);
  });
});
