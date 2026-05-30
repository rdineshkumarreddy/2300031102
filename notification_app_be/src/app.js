const express = require('express');
const cors = require('cors');
const { loggingMiddleware } = require('../../logging_middleware');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Global logging middleware integration
app.use(loggingMiddleware);

// Mount API routes
app.use('/api', notificationRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  const { logger } = require('../../logging_middleware');
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error(`Error: ${message}`, {
    statusCode,
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
