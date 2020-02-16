const appRoot = require('app-root-path');
const options = {
  file: {
    level: 'debug',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 25242880, // 25MB
    maxFiles: 5,
    colorize: false,
    timestamp: true,
  },
  errorsFile: {
    level: 'error',
    filename: `${appRoot}/logs/errors.log`,
    handleExceptions: true,
    json: true,
    maxsize: 25242880, // 25MB
    maxFiles: 5,
    colorize: false,
    timestamp: true,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    timestamp: true,
  },
};

module.exports = options;
