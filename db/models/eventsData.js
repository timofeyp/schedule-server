const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const EventsData = new Schema({
  data: Object,
  event_id: Array,
});

module.exports = mongoose.model('eventsData', EventsData);
