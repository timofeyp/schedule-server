const mongoose = require('src/utils/mongoose');
const { Schema } = mongoose;

const VCParts = new Schema({
  id: Number,
  groupId: Number,
  groupName: String,
  name: String,
});

module.exports = mongoose.model('v-c-parts', VCParts);
