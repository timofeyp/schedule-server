const winston = require('winston');
const { format } = winston;
const options = require('config/winston');
const moment = require('moment');


const getLogger = (module) => {
  const path = module.filename.split('/').slice(-2).join('/');
  return winston.createLogger({
    format: format.combine(
      format.errors({ stack: true }),
      format.timestamp({
        format: () => moment().format('YYYY-MM-DD HH:mm:ss'),
      }),
      format.json(),
      format.prettyPrint(),
    ),
    transports: [
      new winston.transports.File(options.file),
      new winston.transports.Console({ ...options.console, label: path }),
      new winston.transports.File({ ...options.errorsFile, label: path }),
    ],
  });
};

module.exports = getLogger;
