const HttpStatus = require('http-status-codes');

module.exports = (req, res, next) => {
  if (req.isUnauthenticated()) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }
  return next();
};
