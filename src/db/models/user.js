const mongoose = require('src/utils/mongoose');
const { Schema } = mongoose;

const User = new Schema({
  login: String,
  company: String,
  department: String,
  phone: String,
  title: String,
  name: String,
  mail: String,
  isAdmin: Boolean,
  ntHashedPassword: String,
  lmHashedPassword: String,
});

module.exports = mongoose.model('user', User);
