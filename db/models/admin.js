const mongoose = require('utils/mongoose');
const { Schema } = mongoose;

const Admin = new Schema({
  username: String,
});

module.exports = mongoose.model('admin', Admin);
