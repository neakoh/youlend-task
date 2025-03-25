const promClient = require('prom-client');

function setupMetrics() {
  // Create a Registry to register the metrics
  const register = new promClient.Registry();

  // Enable the collection of default metrics
  promClient.collectDefaultMetrics({
    app: 'youlend-sample-app',
    prefix: 'app_',
    timeout: 10000,
    register
  });

  // Define custom metrics
  const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000]
  });

  const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  });

  // Register the metrics
  register.registerMetric(httpRequestDurationMicroseconds);
  register.registerMetric(httpRequestCounter);

  // Create middleware for tracking request metrics
  const trackMetrics = (req, res, next) => {
    // Skip metrics endpoint to avoid circular measurements
    if (req.path === '/metrics' || req.path === '/health') {
      return next();
    }

    const start = Date.now();
    const end = res.end;
    
    // Override end method to capture metrics when the response is sent
    res.end = function(...args) {
      const duration = Date.now() - start;
      const route = req.route ? req.route.path : req.path;
      const statusCode = res.statusCode;
      
      // Record request duration
      httpRequestDurationMicroseconds
        .labels(req.method, route, statusCode)
        .observe(duration);
      
      // Increment request counter
      httpRequestCounter
        .labels(req.method, route, statusCode)
        .inc();
      
      // Call the original end method
      return end.apply(this, args);
    };
    
    next();
  };

  // Create middleware for the metrics endpoint
  const metricsMiddleware = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  };

  return {
    register,
    trackMetrics,
    metricsMiddleware,
    httpRequestDurationMicroseconds,
    httpRequestCounter
  };
}

module.exports = { setupMetrics };
