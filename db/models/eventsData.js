const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const EventsData = new Schema({
  room: Object,
  eventName: String,
  dateStart: Date,
  VCPartsIDs: Array,
  responsibleDept: String,
  responsibleDisplayname: String,
  ownerDisplayname: String,
  chairman: String,
  presentation: Boolean,
  yearMonthDay: String,
  timeStart: String,
  timeEnd: String,
  VCParts: Array,
  additional: Array,
  eventID: Number,
}, { toJSON: { virtuals: true } });

EventsData.virtual('confirm', {
  ref: 'localConfirmations',
  localField: 'eventID',
  foreignField: 'eventID',
  justOne: false,
  options: { sort: { name: -1 }, limit: 5 },
});

module.exports = mongoose.model('eventsData', EventsData);
