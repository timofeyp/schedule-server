const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const VCPartsCategory = new Schema({
  _id: Number,
  group_name: String,
  vc_parts: Array,
});

module.exports = mongoose.model('VCPartsCategory', VCPartsCategory);
