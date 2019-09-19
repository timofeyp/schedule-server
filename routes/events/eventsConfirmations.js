const {
  EventsData, LocalConfirmations,
} = require('../../db');
const Moment = require('moment');
const HttpStatus = require('http-status-codes');

const localConfirmEvent = async (req, res) => {
  const { id } = req.params;
  await LocalConfirmations.findOneAndUpdate({ eventID: id, user: req.user }, {
    eventID: id, user: req.user, date: Moment().utc(true).toISOString(),
  }, { upsert: true }).populate({ path: 'confirm', populate: { path: 'userData' } });
  const event = await EventsData
    .findOne({ _id: id })
    .populate({ path: 'confirm', populate: { path: 'userData' } });
  return res.status(HttpStatus.OK).json(event);
};

module.exports = {
  localConfirmEvent,
};
