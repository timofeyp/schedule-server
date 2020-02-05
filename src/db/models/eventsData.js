const mongoose = require('src/utils/mongoose');
const { Schema } = mongoose;

const EventsData = new Schema({
  localRoom: String,
  room: Object,
  eventName: String,
  dateStart: Date,
  dateTimeStart: Date,
  dateTimeEnd: { type: Date, timezone: 'Europe/Moscow' },
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
  isHidden: Boolean,
  isCanceled: Boolean,
  isVideo: Boolean,
  isLocal: Boolean,
}, { toJSON: { virtuals: true } });

EventsData.virtual('confirm', {
  ref: 'localConfirmations',
  localField: '_id',
  foreignField: 'eventID',
  justOne: false,
});

module.exports = mongoose.model('eventsData', EventsData);
