const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const EventsData = new Schema({
  data: Object,
  eventID: Number,
});

module.exports = mongoose.model('eventsData', EventsData);
