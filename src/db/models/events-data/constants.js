const moment = require('moment');

const getBeginningToday = () =>
  moment()
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0);
const getEndingToday = () =>
  moment()
    .hour(23)
    .minute(59)
    .second(59)
    .millisecond(999);

const getUnixWeek = () => ({
  $gte: getBeginningToday().unix() * 1000,
  $lte:
    getEndingToday()
      .add(6, 'day')
      .unix() * 1000,
});

const getDateWeek = () => ({
  $gte: getBeginningToday()
    .utcOffset(3)
    .toDate(),
  $lte: getEndingToday()
    .add(6, 'day')
    .utcOffset(3)
    .toDate(),
});

module.exports = {
  getUnixWeek,
  getDateWeek,
};
