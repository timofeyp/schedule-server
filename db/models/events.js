const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const Events = new Schema({
  date: Date,
  events: Array,
});

module.exports = mongoose.model('events', Events);
