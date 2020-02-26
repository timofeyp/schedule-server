const moment = require('moment');

const beginningMomentDay = moment()
  .hour(0)
  .minute(0)
  .second(0)
  .millisecond(0);
const endingMomentDay = moment()
  .hour(23)
  .minute(59)
  .second(59)
  .millisecond(999);

const unixWeek = {
  $gte: beginningMomentDay.unix() * 1000,
  $lte: endingMomentDay.add(6, 'day').unix() * 1000,
};

const dateWeek = {
  $gte: beginningMomentDay.utcOffset(3).toDate(),
  $lte: endingMomentDay
    .add(6, 'day')
    .utcOffset(3)
    .toDate(),
};

module.exports = {
  unixWeek,
  dateWeek,
};
