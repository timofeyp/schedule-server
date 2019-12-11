const mongoose = require('../../utils/mongoose');
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
});

module.exports = mongoose.model('user', User);
