import request from 'supertest';
import { createApp } from '../../src/app';
import { seedDatabase } from '../../src/db/seed';

describe('Applications API Integration Tests', () => {
  const app = createApp();
  let adminToken: string;
  let applicantToken: string;
  let employerToken: string;
  let jobId: string;
  let createdAppId: string;

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

    const employerLogin = await request(app).post('/api/auth/login').send({
      email: 'recruiter@cloudscale.io',
      password: 'Employer123!',
    });
    employerToken = employerLogin.body.data.token;

    const jobsRes = await request(app).get('/api/jobs');
    jobId = jobsRes.body.data.jobs[0].id;
  });

  it('POST /api/jobs/:id/apply should reject unauthenticated request', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .send({
        full_name: 'Anonymous Candidate',
        email: 'anon@test.io',
      });
    expect(res.status).toBe(401);
  });

  it('POST /api/jobs/:id/apply should submit application as authenticated applicant', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({
        full_name: 'Alex Cloud Dev',
        email: 'alex.dev@cloud.io',
        phone: '+1 555-0199',
        resume_url: 'https://storage.cloud.io/resumes/alex-devops.pdf',
        cover_letter: 'I have 6 years experience with Kubernetes and Terraform.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application).toBeDefined();
    expect(res.body.data.application.job_id).toBe(jobId);
    createdAppId = res.body.data.application.id;
  });

  it('GET /api/applications should list user submitted applications', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${applicantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.applications)).toBe(true);
    expect(res.body.data.applications.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/applications/:id should return single application details', async () => {
    if (!createdAppId) return;

    const res = await request(app)
      .get(`/api/applications/${createdAppId}`)
      .set('Authorization', `Bearer ${applicantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application.id).toBe(createdAppId);
  });

  it('PATCH /api/applications/:id/status should allow employer/admin to update status', async () => {
    if (!createdAppId) return;

    const res = await request(app)
      .patch(`/api/applications/${createdAppId}/status`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        status: 'REVIEWED',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application.status).toBe('REVIEWED');
  });
});
