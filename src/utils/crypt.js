const Cryptr = require('cryptr');
const config = require('config');
const secret = config.get('cryptr.secret');
const cryptr = new Cryptr(secret);

const encrypt = string => cryptr.encrypt(string);
const decrypt = string => cryptr.decrypt(string);

module.exports = {
  encrypt,
  decrypt,
};
