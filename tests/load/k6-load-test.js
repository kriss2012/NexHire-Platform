import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Configuration designed to demonstrate Kubernetes HPA scaling
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Warm up with 20 users (2 pods baseline)
    { duration: '1m', target: 80 },    // Spike traffic to 80 users (CPU rises, HPA triggers 4 pods)
    { duration: '2m', target: 150 },   // Peak load: 150 users (HPA scales to 6-8 pods)
    { duration: '1m', target: 20 },    // Scale down traffic
    { duration: '30s', target: 0 },    // Cooldown (HPA scales back to 2 pods)
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],                  // Error rate < 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001';

export default function () {
  // 1. Query Job listings (Redis cache-aside test)
  const jobsRes = http.get(`${BASE_URL}/api/jobs?limit=10`);
  check(jobsRes, {
    'jobs status is 200': (r) => r.status === 200,
    'has x-cache header': (r) => r.headers['X-Cache'] !== undefined,
  });

  // 2. Query specific job detail
  const searchRes = http.get(`${BASE_URL}/api/jobs?q=Kubernetes`);
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
  });

  // 3. Health probe test
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
