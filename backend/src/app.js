const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const rateLimiter = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const crypto = require('crypto');
const app = express();

// Request ID assignment middleware
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || `req_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  req.id = reqId;
  req.headers['x-request-id'] = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
});

// Security & request parsing middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting & logging middleware
app.use(rateLimiter);
app.use(requestLogger);

// Mount API routes
app.use('/api', apiRoutes);

// Unhandled route & error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
