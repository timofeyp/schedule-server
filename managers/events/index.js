const queryString = require('query-string');
const {
  Events, EventsData, EventsNames,
} = require('../../db');
const Moment = require('moment');
const currentDay = i => Moment().add(i, 'day');
const {
  eventsUrl, eventUrl, weekEventsRequestPeriod, todayEventsRequestPeriod, increaseDaysArray, requestEventsDataPause, setCookiesPeriod,
} = require('managers/events/constants');
const { requestData } = require('managers/events/requestData');
const setCookies = require('managers/events/setCookies');
const log = require('utils/log')(module);
const { intervalWork } = require('utils');

const requestedDays = {};

const eventsWorker = async () => {
  try {
    await intervalWork(setCookies, setCookiesPeriod);
    await intervalWork(requestToday, todayEventsRequestPeriod);
    weekEventsRequest();
  } catch (e) {
    log.error(e);
  }
};

module.exports = eventsWorker;


const weekEventsRequest = () => {
  if (!requestedDays.week) {
    intervalWork(requestWeek, weekEventsRequestPeriod);
  }
};

const requestToday = async () => {
  const eventsQuery = queryString.stringify({
    action: 'refresh',
    date_refresh: currentDay(0).format('DD.MM.YYYY'),
  });
  const eventsResp = await requestData(eventsUrl, eventsQuery);
  createEvents(eventsResp, currentDay(0).format('DD-MM-YYYY'));
};

const requestWeek = async () => {
  requestedDays.week = true;
  for (const i of increaseDaysArray) {
    const eventsQuery = queryString.stringify({
      action: 'refresh',
      date_refresh: currentDay(i).format('DD.MM.YYYY'),
    });
    const eventsResp = await requestData(eventsUrl, eventsQuery);
    await createEvents(eventsResp, currentDay(i).format('DD-MM-YYYY'));
  }
  delete requestedDays.week;
};

const createEvents = (resp, day) => new Promise(async (res, rej) => {
  if (resp.events && resp.events.length && !requestedDays[day]) {
    requestedDays[day] = true;
    const vcevents = resp.events.filter(event => event.vc_required);
    try {
      await Events.findOneAndUpdate({
        date: day,
      }, {
        date: day,
        events: vcevents,
      }, { upsert: true });
      await eventsDataManager.requestEventsData(vcevents, day);
      res(vcevents);
      delete requestedDays[day];
    } catch (e) {
      rej(e);
    }
  } else if (resp.events.length === 0) {
    res([]);
  }
});

const eventsDataManager = {
  pausedEvents: {},
  resetEventsPause(day) {
    delete this.pausedEvents[day];
  },
  async requestEventsData(events, day) {
    const query = queryString.stringify({
      action: 'initStartParams',
    });
    if (!this.pausedEvents[day]) {
      this.pausedEvents[day] = true;
      for (const event of events) {
        const eventID = event.event_id;
        const data = await requestData(eventUrl(eventID), query);
        const item = this.prepareEventItem(data, eventID);
        await EventsData.findOneAndUpdate({ eventID }, item, { upsert: true });
      }
      setTimeout(() => this.resetEventsPause(day), requestEventsDataPause);
    }
  },
  async prepareEventItem(data, eventID) {
    const pattern = data.event_name.replace(/[^A-zА-я0-9]/gmi, '\\W');
    await EventsNames.findOneAndUpdate({ name: { $regex: new RegExp(pattern, 'i') } }, { name: data.event_name }, { upsert: true });
    const room = data.rooms ? data.rooms.filter(el => el.id === data.selected_room) : [];
    const dateStart = Moment(data.date_start).toDate();
    // eslint-disable-next-line radix
    const VCPartsIDs = data.selected_vc_parts ? data.selected_vc_parts.map(el => parseInt(el)) : [];
    const yearMonthDay = Moment(dateStart).format('DD-MM-YYYY');
    const timeStart = `${data.HStart}:${data.MStart === 0 ? '00' : data.MStart}`;
    const timeEnd = `${data.HEnd}:${data.MEnd === 0 ? '00' : data.MEnd}`;
    const VCPartsArr = data.vc_parts.reduce((VCPartsArray, el) => {
      const groupName = el.group_name;
      const VCParts = el.vc_parts.filter(i => VCPartsIDs.includes(i.id));
      if (VCParts.length) {
        VCPartsArray.push({ groupName, VCParts });
      }
      return VCPartsArray;
    }, []);
    return {
      eventID,
      room: room[0],
      eventName: data.event_name,
      dateStart,
      VCPartsIDs,
      responsibleDept: data.responsible_dept,
      responsibleDisplayname: data.responsible_displayname,
      ownerDisplayname: data.owner_displayname,
      chairman: data.chairman_displayname,
      presentation: data.presentation,
      yearMonthDay,
      timeStart,
      timeEnd,
      VCParts: VCPartsArr,
      additional: data.reqaddpart,
    };
  },
};

