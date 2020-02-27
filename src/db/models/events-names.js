const mongoose = require('src/utils/mongoose');
const { Schema } = mongoose;

const eventsNames = new Schema({
  name: String,
});

module.exports = mongoose.model('events-names', eventsNames);
