import client from 'prom-client';

// Create a Registry which registers the metrics
export const register = new client.Registry();

// Add default metrics (process CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register });

// Custom Application Metrics
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed by JobBoard API',
  labelNames: ['method', 'path', 'status'],
});

export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const httpActiveRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Current number of active requests being handled',
});

export const cacheHitsTotal = new client.Counter({
  name: 'redis_cache_hits_total',
  help: 'Total number of Redis cache hits',
  labelNames: ['cache_key'],
});

export const cacheMissesTotal = new client.Counter({
  name: 'redis_cache_misses_total',
  help: 'Total number of Redis cache misses',
  labelNames: ['cache_key'],
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpActiveRequests);
register.registerMetric(cacheHitsTotal);
register.registerMetric(cacheMissesTotal);
