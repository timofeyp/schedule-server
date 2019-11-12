const winston = require('winston');
const { format } = winston;
const options = require('config/winston');


const getLogger = (module) => {
  const path = module.filename.split('/').slice(-2).join('/');
  return winston.createLogger({
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    transports: [
      new winston.transports.File(options.file),
      new winston.transports.Console({ ...options.console, label: path }),
    ],
  });
};

module.exports = getLogger;
