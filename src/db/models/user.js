const mongoose = require('src/utils/mongoose');
const { Schema } = mongoose;

const User = new Schema({
  login: String,
  company: String,
  departament: String,
  phone: String,
  title: String,
  name: String,
  mail: String,
  isAdmin: Boolean,
  hash: String,
});

module.exports = mongoose.model('user', User);
