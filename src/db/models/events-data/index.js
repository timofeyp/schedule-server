const mongoose = require('src/utils/mongoose');
const getWeekEventsQuery = require('src/db/models/events-data/get-week-events-query');
const getEventDataQuery = require('src/db/models/events-data/get-event-data-query');
const getSelectedVCPartsQuery = require('src/db/models/events-data/get-selected-v-c-parts-query');
const getVCPartsQuery = require('src/db/models/events-data/get-v-c-parts-query');
const { Schema } = mongoose;

const EventsData = new Schema(
  {
    localRoom: String,
    room: Object,
    eventName: { type: String, required: true },
    dateStart: { type: Date, required: true },
    dateTimeStart: { type: Date, required: true },
    dateTimeEnd: { type: Date, required: true },
    VCPartsIDs: Array,
    responsibleDept: String,
    responsibleDisplayname: String,
    ownerDisplayname: String,
    chairman: String,
    presentation: Boolean,
    yearMonthDay: { type: String, required: true },
    timeStart: { type: String, required: true },
    timeEnd: { type: String, required: true },
    VCParts: Array,
    additional: Array,
    eventID: Number,
    isHidden: Boolean,
    isCanceled: Boolean,
    isVideo: Boolean,
    isLocal: Boolean,
    isUpdated: Boolean,
    isPossiblyCanceled: Boolean,
  },
  { toJSON: { virtuals: true } },
);

EventsData.virtual('confirm', {
  ref: 'localConfirmations',
  localField: '_id',
  foreignField: 'eventID',
  justOne: false,
});

EventsData.statics.getWeekEventsQuery = getWeekEventsQuery;
EventsData.statics.getEventDataQuery = getEventDataQuery;
EventsData.statics.getSelectedVCPartsQuery = getSelectedVCPartsQuery;
EventsData.statics.getVCPartsQuery = getVCPartsQuery;

module.exports = mongoose.model('events-data', EventsData);
