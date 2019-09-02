const {
  EventsData, LocalConfirmations,
} = require('../../db');
const Moment = require('moment');
const HttpStatus = require('http-status-codes');

const localConfirmEvent = async (req, res) => {
  const { id } = req.params;
  await LocalConfirmations.findOneAndUpdate({ user: req.user }, {
    eventID: id, user: req.user, date: Moment().utc(true).toISOString(),
  }, { upsert: true }).populate({ path: 'confirm', populate: { path: 'confirm' } });
  const event = await EventsData
    .findOne({ eventID: id })
    .populate({ path: 'confirm', populate: { path: 'confirm' } });
  return res.status(HttpStatus.OK).json(event);
};

module.exports = {
  localConfirmEvent,
};
