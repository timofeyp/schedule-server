const queryString = require('query-string');
const DataManager = require('src/managers/events/data');
const { Events } = require('src/db');
const {
  eventsUrl,
  currentDay,
  daysExceptToday,
} = require('src/managers/events/constants');
const { requestData } = require('src/managers/events/utils/request-data');
const markCanceled = require('src/managers/events/utils/mark-canceled');

class ScheduleManager extends DataManager {
  constructor() {
    super();
    this.extraCallProtection = {};
  }

  requestToday = async () => this.tryRequestEvents(0);

  requestWeek = async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const i of daysExceptToday) {
      // eslint-disable-next-line no-await-in-loop
      await this.tryRequestEvents(i);
    }
  };

  tryRequestEvents = async dayShift => {
    try {
      if (!this.extraCallProtection[dayShift]) {
        this.extraCallProtection[dayShift] = true;
        await this.requestEvents(dayShift);
      }
    } finally {
      delete this.extraCallProtection[dayShift];
    }
  };

  requestEvents = async dayShift => {
    const eventsQuery = this.getRequestQuery(dayShift);
    const eventsResp = await requestData(eventsUrl, eventsQuery);
    await this.handleEvents(
      eventsResp,
      currentDay(dayShift).format('DD-MM-YYYY'),
    );
  };

  getRequestQuery = dayShift =>
    queryString.stringify({
      action: 'refresh',
      date_refresh: currentDay(dayShift).format('DD.MM.YYYY'),
    });

  handleEvents = async (resp, date) => {
    if (resp.events && resp.events.length) {
      const events = resp.events.filter(event => event.vc_required);
      await this.storeEvents(date, events);
      await this.requestEventsData(events, date);
      await markCanceled(date);
      return events;
    }
    return [];
  };

  storeEvents = async (date, events) =>
    Events.findOneAndUpdate(
      {
        date,
      },
      {
        date,
        events,
      },
      { upsert: true },
    );
}

module.exports = ScheduleManager;
