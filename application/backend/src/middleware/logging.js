const winston = require('winston');
const expressWinston = require('express-winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

function setupLogging() {
  // Configure Elasticsearch transport
  const esTransportOpts = {
    level: process.env.LOG_LEVEL || 'info',
    clientOpts: {
      node: `${process.env.ELASTICSEARCH_HOST || 'http://localhost'}:${process.env.ELASTICSEARCH_PORT || '9200'}`,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'password'
      },
      ssl: {
        rejectUnauthorized: false
      }
    },
    indexPrefix: 'youlend-app-logs'
  };

  // Create Elasticsearch transport
  const esTransport = new ElasticsearchTransport(esTransportOpts);

  // Handle errors from Elasticsearch transport
  esTransport.on('error', (error) => {
    console.error('Error in Elasticsearch transport:', error);
  });

  // Create console transport
  const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, meta }) => {
        return `${timestamp} ${level}: ${message} ${meta ? JSON.stringify(meta) : ''}`;
      })
    )
  });

  // Create request logger middleware
  const requestLogger = expressWinston.logger({
    transports: [
      consoleTransport,
      process.env.NODE_ENV !== 'test' ? esTransport : null
    ].filter(Boolean),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    ignoreRoute: (req, res) => {
      // Don't log metrics endpoint requests to avoid noise
      return req.path === '/metrics' || req.path === '/health';
    }
  });

  // Create error logger middleware
  const errorLogger = expressWinston.errorLogger({
    transports: [
      consoleTransport,
      process.env.NODE_ENV !== 'test' ? esTransport : null
    ].filter(Boolean),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  });

  // Create a logger instance for use in application code
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: 'youlend-app' },
    transports: [
      consoleTransport,
      process.env.NODE_ENV !== 'test' ? esTransport : null
    ].filter(Boolean)
  });

  return {
    requestLogger,
    errorLogger,
    logger
  };
}

module.exports = { setupLogging };
