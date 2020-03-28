const queryString = require('query-string');
const { Events, EventsData } = require('src/db');
const updateEventNames = require('src/managers/events/update-events-names');
const Moment = require('moment');
const currentDay = i => Moment().add(i, 'day');
const {
  eventsUrl,
  eventUrl,
  weekEventsRequestPeriod,
  todayEventsRequestPeriod,
  increaseDaysArray,
  requestEventsDataPause,
  setCookiesPeriod,
  hideDoublesPeriod,
} = require('src/managers/events/constants');
const { requestData } = require('src/managers/events/request-data');
const hideDoubles = require('src/managers/events/hide-doubles');
const markCanceled = require('src/managers/events/mark-canceled');
const setCookies = require('src/managers/events/set-cookies');
const storeVCParts = require('src/managers/events/store-v-c-parts');
const log = require('src/utils/log')(module);
const { intervalWork } = require('src/utils');
const { requestEventsData } = require('src/managers/events/data');

const requestedDays = {};

const eventsWorker = async () => {
  try {
    await intervalWork(setCookies, setCookiesPeriod);
    await intervalWork(requestToday, todayEventsRequestPeriod);
    await intervalWork(requestWeek, weekEventsRequestPeriod);
    await intervalWork(hideDoubles, hideDoublesPeriod);
  } catch (e) {
    log.error(e);
  }
};

module.exports = eventsWorker;

const requestEvents = async dayShift => {
  const eventsQuery = queryString.stringify({
    action: 'refresh',
    date_refresh: currentDay(dayShift).format('DD.MM.YYYY'),
  });
  const eventsResp = await requestData(eventsUrl, eventsQuery);
  await createEvents(eventsResp, currentDay(dayShift).format('DD-MM-YYYY'));
};

const requestToday = async () => requestEvents(0);

const requestWeek = async () => {
  if (!requestedDays.week) {
    requestedDays.week = true;
    // eslint-disable-next-line no-restricted-syntax
    for (const i of increaseDaysArray) {
      // eslint-disable-next-line no-await-in-loop
      await requestEvents(i);
    }
  }
  delete requestedDays.week;
};

const createEvents = (resp, date) =>
  new Promise(async (res, rej) => {
    if (resp.events && resp.events.length && !requestedDays[date]) {
      requestedDays[date] = true;
      const events = resp.events.filter(event => event.vc_required);
      try {
        await Events.findOneAndUpdate(
          {
            date,
          },
          {
            date,
            events,
          },
          { upsert: true },
        );
        await requestEventsData(events, date);
        await markCanceled(date);
        res(events);
        delete requestedDays[date];
      } catch (e) {
        rej(e);
      }
    } else if (resp.events.length === 0) {
      res([]);
    }
  });
