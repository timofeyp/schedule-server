const mongoose = require('src/utils/mongoose');
const { Schema } = mongoose;

const VCParts = new Schema({
  _id: Number,
  name: String,
});

module.exports = mongoose.model('VCParts', VCParts);
