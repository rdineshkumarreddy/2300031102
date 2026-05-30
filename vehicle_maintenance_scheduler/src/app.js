const express = require('express');
const cors = require('cors');
const loggingMiddleware = require('./middleware/logging.middleware');
const errorHandler = require('./middleware/error.middleware');
const schedulerRoutes = require('./routes/scheduler.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Global logging middleware applied to all requests
app.use(loggingMiddleware);

// Mount API routes
app.use('/api', schedulerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 Route Handler
app.use((req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
