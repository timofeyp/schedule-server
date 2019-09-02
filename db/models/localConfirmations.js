const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const LocalConfirmations = new Schema({
  eventID: Number,
  user: String,
  date: Date,
}, { toJSON: { virtuals: true } });

LocalConfirmations.virtual('confirm', {
  ref: 'user',
  localField: 'user',
  foreignField: 'user',
  justOne: false,
  options: { sort: { name: -1 }, limit: 5 },
});

module.exports = mongoose.model('localConfirmations', LocalConfirmations);
