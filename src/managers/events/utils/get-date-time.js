const Moment = require('moment');

module.exports = data => {
  const dateStart = Moment(data.date_start)
    .startOf('day')
    .utcOffset(3)
    .toDate();
  const dateTimeStart = Moment(data.date_start)
    .hours(data.HStart)
    .minutes(data.MStart)
    .utcOffset(3)
    .toDate();
  const dateTimeEnd = Moment(data.date_start)
    .hours(data.HEnd)
    .minutes(data.MEnd)
    .utcOffset(3)
    .toDate();
  const yearMonthDay = Moment(dateStart).format('DD-MM-YYYY');
  const timeStart = `${data.HStart}:${data.MStart === 0 ? '00' : data.MStart}`;
  const timeEnd = `${data.HEnd}:${data.MEnd === 0 ? '00' : data.MEnd}`;
  return {
    dateStart,
    dateTimeStart,
    dateTimeEnd,
    timeStart,
    timeEnd,
    yearMonthDay,
  };
};
