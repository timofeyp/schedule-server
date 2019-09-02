const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const User = new Schema({
  user: String,
  company: String,
  departament: String,
  phone: String,
  title: String,
  name: String,
  mail: String,
});

module.exports = mongoose.model('user', User);
