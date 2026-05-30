const { Log } = require('../../../logging_middleware');

module.exports = {
  info: (msg, pkg = 'service') => Log('backend', 'info', pkg, msg),
  warn: (msg, pkg = 'service') => Log('backend', 'warn', pkg, msg),
  error: (msg, pkg = 'service') => Log('backend', 'error', pkg, msg),
  debug: (msg, pkg = 'service') => Log('backend', 'debug', pkg, msg),
  fatal: (msg, pkg = 'service') => Log('backend', 'fatal', pkg, msg),
  Log
};
