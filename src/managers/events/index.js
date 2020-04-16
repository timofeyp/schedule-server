const {
  weekEventsRequestPeriod,
  todayEventsRequestPeriod,
  setCookiesPeriod,
  hideDoublesPeriod,
} = require('src/managers/events/constants');
const hideDoubles = require('src/managers/events/utils/hide-doubles');
const setCookies = require('src/managers/events/utils/set-cookies');

const log = require('src/utils/log')(module);
const { intervalWork } = require('src/utils');
const ScheduleManager = require('src/managers/events/schedule');
const schedule = new ScheduleManager();

const eventsWorker = async () => {
  try {
    await intervalWork(setCookies, setCookiesPeriod);
    await intervalWork(schedule.requestToday, todayEventsRequestPeriod);
    await intervalWork(schedule.requestWeek, weekEventsRequestPeriod);
    await intervalWork(hideDoubles, hideDoublesPeriod);
  } catch (e) {
    log.error(e);
  }
};

module.exports = eventsWorker;
