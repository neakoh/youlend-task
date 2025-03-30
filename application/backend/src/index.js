require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupLogging } = require('./middleware/logging');
const { setupMetrics } = require('./middleware/metrics');

// Create Express application
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Winston logging with Elasticsearch transport
const { requestLogger, errorLogger } = setupLogging();
app.use(requestLogger);

// Setup Prometheus metrics
const { trackMetrics, metricsMiddleware } = setupMetrics();
app.use(trackMetrics); // Track all HTTP requests
app.get('/metrics', metricsMiddleware); // Metrics endpoint

// Define routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to YouLend Sample API' });
});

// API routes
const apiRoutes = require('./routes/loanRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/loans', apiRoutes);
app.use('/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
