const mongoose = require('src/utils/mongoose');
const { Schema } = mongoose;

const LocalConfirmations = new Schema({
  eventID: { type: Schema.Types.ObjectId, ref: 'eventsData' },
  userID: { type: Schema.Types.ObjectId, ref: 'user' },
  date: Date,
}, { toJSON: { virtuals: true } });

LocalConfirmations.virtual('userData', {
  ref: 'user',
  localField: 'user',
  foreignField: 'login',
  justOne: true,
});

module.exports = mongoose.model('localConfirmations', LocalConfirmations);
