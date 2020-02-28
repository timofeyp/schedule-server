const HttpStatus = require('http-status-codes');

const getUsers = async (req, res) => {
  const user = req.user;
  return res.status(HttpStatus.OK).end();
};

module.exports = {
  getUsers,
};
