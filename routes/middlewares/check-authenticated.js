const HttpStatus = require('http-status-codes');

/**
 * Данный мидлвер осуществляет проверку аутентификации пользователя.
 */
module.exports = (req, res, next) => {
  if (req.isUnauthenticated()) {
    return res.sendStatus(HttpStatus.UNAUTHORIZED);
  }
  return next();
};