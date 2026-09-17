import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '15s',
  thresholds: {
    http_req_failed: ['rate==0'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3001';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  const jobs = http.get(`${BASE_URL}/api/jobs`);
  check(jobs, {
    'jobs returned': (r) => r.status === 200,
  });

  sleep(1);
}
