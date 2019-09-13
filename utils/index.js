const mongoose = require('./mongoose');

// The purpose this is to make sure every successful
// and error response is sent in the same format.
const error = (res, err, code) => { // Error Web Response
  if (typeof err === 'object' && typeof err.message !== 'undefined') {
    err = err.message;
  }
  return response(res, { error: err }, code, false);
};

const success = (res, data, code) => response(res, data, code, true);

const response = (res, data, code, success) => {
  if (typeof code !== 'undefined') {
    res.statusCode = code;
  }
  return res.json({ ...data, success });
};

module.exports = { mongoose, success, error };
