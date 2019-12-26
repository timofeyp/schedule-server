const {
  LocalConfirmations,
} = require('../../db');
const Moment = require('moment');
const HttpStatus = require('http-status-codes');

const localConfirmEvent = async (req, res) => {
  const { id } = req.params;
  await LocalConfirmations.findOneAndUpdate({ eventID: id, userID: req.user._id }, {
    eventID: id, user: req.user._id, date: Moment().utc(true).toISOString(),
  }, { upsert: true });
  return res.status(HttpStatus.NO_CONTENT);
};

module.exports = {
  localConfirmEvent,
};
