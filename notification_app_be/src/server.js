require('dotenv').config();
const app = require('./app');
const { logger } = require('../../logging_middleware');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.info(`Notification Priority Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { reason: reason instanceof Error ? reason.message : reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', { error: error.message, stack: error.stack });
  server.close(() => {
    process.exit(1);
  });
});
