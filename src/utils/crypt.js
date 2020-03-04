const NTLMAuth = require('httpntlm').ntlm;
const Cryptr = require('cryptr');
const config = require('config');
const secret = config.get('cryptr.secret');
const cryptr = new Cryptr(secret);

const getArray = buffer => Array.prototype.slice.call(buffer, 0);

const hashAndEncryptPass = string => {
  const ntHashedPassword = NTLMAuth.create_NT_hashed_password(string);
  const lmHashedPassword = NTLMAuth.create_LM_hashed_password(string);
  const ntArray = getArray(ntHashedPassword);
  const lmArray = getArray(lmHashedPassword);
  return {
    ntHashedPassword: cryptr.encrypt(ntArray),
    lmHashedPassword: cryptr.encrypt(lmArray),
  };
};

const decryptPass = (ntHashedPassword, lmHashedPassword) => {
  const ntString = cryptr.decrypt(ntHashedPassword);
  const lmString = cryptr.decrypt(lmHashedPassword);
  const ntArray = ntString.split(',');
  const lmArray = lmString.split(',');
  return {
    nt_password: Buffer.from(ntArray),
    lm_password: Buffer.from(lmArray),
  };
};

module.exports = {
  hashAndEncryptPass,
  decryptPass,
};
