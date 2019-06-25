const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const Events = new Schema({
  date: String,
  events: Array,
});

module.exports = mongoose.model('events', Events);
