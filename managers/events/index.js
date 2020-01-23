const queryString = require('query-string');
const request = require('request');
const jar = request.jar();
const {
  Events, EventsData, EventsNames,
} = require('../../db');
const Moment = require('moment');
const currentDay = i => Moment().add(i, 'day');
const { eventsUrl, eventUrl } = require('managers/events/constants');
const setCookies = require('managers/events/setCookies');
const log = require('utils/log')(module);

const requestedDays = {};

const eventsWorker = async () => {
  try {
    await setCookies(jar);
    // todayEventsRequest();
    weekEventsRequest();
  } catch (e) {
    console.log(1)
    log.error(e);
  }
};

module.exports = eventsWorker;

const todayEventsRequest = async () => {
  const eventsQuery = queryString.stringify({
    action: 'refresh',
    date_refresh: currentDay(0).format('DD.MM.YYYY'),
  });
  const eventsResp = await requestData(eventsUrl, eventsQuery);
  createEvents(eventsResp, currentDay(0).format('DD-MM-YYYY'));
};
setInterval(() => {
  todayEventsRequest();
}, 5 * 60 * 1000);

const weekEventsRequest = () => setInterval(() => {
  try {
    requestedDays.week ? null : requestWeek();
  } catch (e) {
    console.log(2)
    log.error(e);
  }
}, 20 * 60 * 1000);

const arr = [...Array(21).keys()];
arr.shift();

const requestWeek = async () => {
  requestedDays.week = true;
  for (const i of arr) {
    const eventsQuery = queryString.stringify({
      action: 'refresh',
      date_refresh: currentDay(i).format('DD.MM.YYYY'),
    });
    const eventsResp = await requestData(eventsUrl, eventsQuery);
    await createEvents(eventsResp, currentDay(i).format('DD-MM-YYYY'));
  }
  delete requestedDays.week;
};

const requestData = (url, query) => new Promise((res, rej) => {
  log.info({ url, query });
  request.post(
    {
      url,
      headers:
        {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          accept: 'text/plain, */*; q=0.01',
          'x-requested-with': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36',
        },
      form: query,
      jar,
    }
    , async (error, response, body) => {
      if (error) {
        rej(error);
      } else if (response.statusCode !== 200) {
        rej(new Error(`Code ${response.statusCode}, message ${response.statusMessage}`));
      } else if (body) {
        try {
          const resp = JSON.parse(body);
          res(resp);
        } catch (e) {
          rej(e);
        }
      }
    }
  );
});

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
  eventsObj: {
    timeoutTrigger: true,
    events: {},
  },
  requestEventsData: async (events, day) => {
    const query = queryString.stringify({
      action: 'initStartParams',
    });
    if (eventsDataManager.eventsObj.events[day] !== true) {
      eventsDataManager.eventsObj.events[day] = true;
      for (const event of events) {
        const data = await requestData(eventUrl(event.event_id), query);
        const pattern = data.event_name.replace(/[^A-zА-я0-9]/gmi, '\\W');
        await EventsNames.findOneAndUpdate({ name: { $regex: new RegExp(pattern, 'i') } }, { name: data.event_name }, { upsert: true });
        const eventID = event.event_id;
        const room = data.rooms.filter(el => el.id === data.selected_room);
        const dateStart = Moment(data.date_start).toDate();
        // eslint-disable-next-line radix
        const VCPartsIDs = data.selected_vc_parts.map(el => parseInt(el));
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
        const item = {
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
        await EventsData.findOneAndUpdate({ eventID }, item, { upsert: true });
      }
    }
    if (eventsDataManager.eventsObj.timeoutTrigger === true) {
      eventsDataManager.eventsObj.timeoutTrigger = false;
      setTimeout(() => {
        eventsDataManager.eventsObj = {
          events: {},
          timeoutTrigger: true,
        };
      }, 1200000);
    }
  },
};

