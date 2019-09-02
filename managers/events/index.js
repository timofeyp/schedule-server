
const {
  Builder, By, until,
} = require('selenium-webdriver');
const queryString = require('query-string');
const request = require('request');
const j = request.jar();
const { Events, EventsData } = require('../../db');
const Moment = require('moment');
const currentDay = i => Moment().add(i, 'day');
const eventsUrl = 'http://saprap.co.rosenergoatom.ru/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2frea!2fca!2fservices_ca!2ffRooms_booking!2frooms_request!2frequests!2ffRoom_requests!2fpScheduler!2fru.rea.i_day_rooms_requests';
const eventUrl = eventId => `http://saprap.co.rosenergoatom.ru/irj/servlet/prt/portal/prtroot/rea.ru~request~rooms~portal.RoomRequest?event_id=${eventId}`;


const eventsWorker = async () => {
  const driver = await new Builder().forBrowser('chrome').build();
  const portalUrl = 'http://a:a@saprap.co.rosenergoatom.ru/irj/portal';
  try {
    await driver.get(portalUrl);
    const loginElem = await driver.wait(until.elementLocated(By.css('*[id="logonuidfield"]')));
    loginElem.sendKeys('asp-pts@ln.rosenergoatom.ru');
    const passElem = await driver.wait(until.elementLocated(By.css('*[id="logonpassfield"]')));
    passElem.sendKeys('Defender');
    const buttonElem = await driver.wait(until.elementLocated(By.css('*[name="uidPasswordLogon"]')));
    buttonElem.click();
    await driver.wait(until.elementLocated(By.css('*[id="contentAreaFrame"]')));
    const cookies = await driver.manage().getCookies();
    driver.quit();
    cookies.forEach((el) => {
      j.setCookie(`${el.name}=${el.value}`, eventsUrl);
    });
    todayEventsRequest();
    weekEventsRequest();
  } catch (e) {
    console.log(e);
  } finally {
    // await driver.quit();
  }
};

module.exports = eventsWorker;

const requestedDays = {};

const todayEventsRequest = () => setInterval(async () => {
  const eventsQuery = queryString.stringify({
    action: 'refresh',
    date_refresh: currentDay(0).format('DD.MM.YYYY'),
  });
  const eventsResp = await requestData(eventsUrl, eventsQuery);
  createEvents(eventsResp, currentDay(0).format('YYYY-MM-DD'));
}, 10000);

const weekEventsRequest = () => setInterval(() => {
  requestedDays.week ? null : requestWeek();
}, 10000);

function* asyncGenerator() {
  let i = 1;
  while (i < 21) {
    yield i++;
  }
}

const requestWeek = async () => {
  requestedDays.week = true;
  for (const i of asyncGenerator()) {
    const eventsQuery = queryString.stringify({
      action: 'refresh',
      date_refresh: currentDay(i).format('DD.MM.YYYY'),
    });
    const eventsResp = await requestData(eventsUrl, eventsQuery);
    await createEvents(eventsResp, currentDay(i).format('YYYY-MM-DD'));
  }
  delete requestedDays.week;
};

const requestData = (url, query) => new Promise((res, rej) => {
  console.log(url, query);
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
      jar: j,
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
        const eventID = event.event_id;
        const room = data.rooms.filter(el => el.id === data.selected_room);
        const dateStart = Moment(data.date_start).toDate();
        // eslint-disable-next-line radix
        const VCPartsIDs = data.selected_vc_parts.map(el => parseInt(el));
        const yearMonthDay = Moment(dateStart).format('YYYY-MM-DD');
        const timeStart = `${data.HStart}:${data.MStart === 0 ? '00' : data.MStart}`;
        const timeEnd = `${data.HEnd}:${data.MEnd === 0 ? '00' : data.MEnd}`;
        const VCPartsArr = data.vc_parts.reduce((arr, el) => {
          const groupName = el.group_name;
          const VCParts = el.vc_parts.filter(i => VCPartsIDs.includes(i.id));
          if (VCParts.length) {
            arr.push({ groupName, VCParts });
          }
          return arr;
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

