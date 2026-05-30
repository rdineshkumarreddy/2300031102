const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaString}\n`;
}

function writeLog(level, message, meta) {
  const formatted = formatMessage(level, message, meta);
  
  if (level === 'ERROR') {
    process.stderr.write(formatted);
  } else {
    process.stdout.write(formatted);
  }

  try {
    fs.appendFileSync(LOG_FILE, formatted);
  } catch (err) {
    process.stderr.write(`Failed to write to log file: ${err.message}\n`);
  }
}

const logger = {
  info: (message, meta) => writeLog('INFO', message, meta),
  error: (message, meta) => writeLog('ERROR', message, meta),
  warn: (message, meta) => writeLog('WARN', message, meta),
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      writeLog('DEBUG', message, meta);
    }
  }
};

const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    const logData = {
      timestamp: new Date().toISOString(),
      method,
      url: originalUrl,
      ip,
      statusCode,
      durationMs: duration,
      rollNo: process.env.ROLL_NO || '2300031102'
    };

    logger.info(`HTTP Request: ${method} ${originalUrl} - Status: ${statusCode} - Time: ${duration}ms`, logData);

    if (process.env.SEND_LOGS_TO_SERVER === 'true') {
      const logsUrl = process.env.LOG_SERVER_URL || 'http://4.224.186.213/evaluation-service/logs';
      const token = process.env.ACCESS_TOKEN;

      axios.post(logsUrl, logData, {
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      }).catch(err => {
        logger.error(`Failed to send HTTP logs to remote server: ${err.message}`);
      });
    }
  });

  next();
};

module.exports = {
  loggingMiddleware,
  logger
};
