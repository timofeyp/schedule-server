const HttpStatus = require('http-status-codes');
const { User } = require('src/db');

const checkAdmin = async (req, res, next) => {
  const user = User.findOne({ user: req.user });
  if (!user.isAdmin || req.user === 'asp-pts') {
    return res.sendStatus(HttpStatus.FORBIDDEN);
  }
  return next();
};

module.exports = checkAdmin;
