const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const eventsNames = new Schema({
  name: String,
});

module.exports = mongoose.model('eventsNames', eventsNames);
