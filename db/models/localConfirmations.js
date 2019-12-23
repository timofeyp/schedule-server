const mongoose = require('../../utils/mongoose');
const { Schema } = mongoose;

const LocalConfirmations = new Schema({
  eventID: mongoose.Types.ObjectId,
  user: String,
  date: Date,
}, { toJSON: { virtuals: true } });

LocalConfirmations.virtual('userData', {
  ref: 'user',
  localField: 'user',
  foreignField: 'login',
  justOne: true,
});

module.exports = mongoose.model('localConfirmations', LocalConfirmations);
