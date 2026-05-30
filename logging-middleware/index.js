const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Predefined valid sets
const VALID_STACKS = new Set(['backend', 'frontend']);
const VALID_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const VALID_BACKEND_PACKAGES = new Set([
  'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'
]);
const VALID_FRONTEND_PACKAGES = new Set([
  'api', 'component', 'hook', 'page', 'state', 'style'
]);
const VALID_COMMON_PACKAGES = new Set([
  'auth', 'config', 'middleware', 'utils'
]);

function validateLogParams(stack, level, pkg) {
  if (!VALID_STACKS.has(stack)) return false;
  if (!VALID_LEVELS.has(level)) return false;
  
  if (stack === 'backend') {
    return VALID_BACKEND_PACKAGES.has(pkg) || VALID_COMMON_PACKAGES.has(pkg);
  } else if (stack === 'frontend') {
    return VALID_FRONTEND_PACKAGES.has(pkg) || VALID_COMMON_PACKAGES.has(pkg);
  }
  return false;
}

// Required Function: Log(stack, level, package, message)
function Log(stack, level, pkg, message) {
  // Normalize parameters to avoid type errors
  let normStack = (typeof stack === 'string' ? stack : 'backend').toLowerCase();
  let normLevel = (typeof level === 'string' ? level : 'info').toLowerCase();
  let normPkg = (typeof pkg === 'string' ? pkg : 'utils').toLowerCase();

  let msgStr = '';
  if (typeof message === 'string') {
    msgStr = message;
  } else if (message !== undefined && message !== null) {
    try {
      msgStr = JSON.stringify(message);
    } catch (e) {
      msgStr = String(message);
    }
  }

  // If parameters are invalid, fall back to valid values to prevent Log API rejection (400)
  if (!validateLogParams(normStack, normLevel, normPkg)) {
    process.stderr.write(`[WARNING] Invalid log params: stack=${stack}, level=${level}, package=${pkg}. Normalizing to fallback values.\n`);
    normStack = 'backend';
    normLevel = 'info';
    normPkg = 'utils';
  }

  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] [${normLevel.toUpperCase()}] [${normStack}/${normPkg}] ${msgStr}\n`;

  // Write to stdout or stderr depending on level
  if (normLevel === 'error' || normLevel === 'fatal') {
    process.stderr.write(formatted);
  } else {
    process.stdout.write(formatted);
  }

  // Append to local log file
  try {
    fs.appendFileSync(LOG_FILE, formatted);
  } catch (err) {
    process.stderr.write(`Failed to write to local log file: ${err.message}\n`);
  }

  // Send log to remote API
  if (process.env.SEND_LOGS_TO_SERVER === 'true') {
    const logsUrl = process.env.LOG_SERVER_URL || 'http://4.224.186.213/evaluation-service/logs';
    const token = process.env.ACCESS_TOKEN;

    axios.post(logsUrl, {
      stack: normStack,
      level: normLevel,
      package: normPkg,
      message: msgStr
    }, {
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    }).catch(err => {
      // Fail silently to prevent crashing the main application thread
      process.stderr.write(`Failed to send log to remote API: ${err.message}\n`);
    });
  }
}

// Express Request logging middleware
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const message = `HTTP Request: ${method} ${originalUrl} - Status: ${statusCode} - Time: ${duration}ms - IP: ${ip}`;
    
    // Uses mandatory Log function with valid backend/middleware parameters
    Log('backend', 'info', 'middleware', message);
  });

  next();
};

module.exports = {
  Log,
  loggingMiddleware
};
