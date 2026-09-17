import request from 'supertest';
import { createApp } from '../../src/app';

describe('Health & Observability Probes Integration Tests', () => {
  const app = createApp();

  it('GET /live should return 200 with alive true', async () => {
    const res = await request(app).get('/live');
    expect(res.status).toBe(200);
    expect(res.body.alive).toBe(true);
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /ready should return 200 readiness status', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
    expect(res.body.details).toBeDefined();
  });

  it('GET /health should return 200 with health checks', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(['ok', 'healthy', 'degraded']).toContain(res.body.status);
    expect(res.body.service).toBe('NexHire API');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/health should return 200 with service NexHire API and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('NexHire API');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/health should return 200 with service NexHire API and status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('NexHire API');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /metrics should return Prometheus metrics with correct content type', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('http_requests_total');
    expect(res.text).toContain('http_request_duration_seconds');
  });
});
