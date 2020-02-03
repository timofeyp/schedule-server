const mongoose = require('src/utils/mongoose');
const { Schema } = mongoose;

const Responses = new Schema({
  date: { type: Date, default: new Date() },
  data: Object,
});

module.exports = mongoose.model('responses', Responses);
