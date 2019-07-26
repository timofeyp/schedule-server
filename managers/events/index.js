const {
  Builder, By, until,
} = require('selenium-webdriver');
const queryString = require('query-string');
const request = require('request');
const j = request.jar();
const { Events, EventsData } = require('../../db');
const moment = require('moment');
const currentDay = i => moment().add(i, 'day').format('DD.MM.YYYY');
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
    date_refresh: currentDay(0),
  });
  const eventsResp = await requestData(eventsUrl, eventsQuery);
  createEvents(eventsResp, currentDay(0));
}, 10000);

const weekEventsRequest = () => setInterval(() => {
  requestedDays.week ? null : requestWeek();
}, 600000);

function* asyncGenerator() {
  let i = 1;
  while (i < 7) {
    yield i++;
  }
}

const requestWeek = async () => {
  requestedDays.week = true;
  for (const i of asyncGenerator()) {
    const eventsQuery = queryString.stringify({
      action: 'refresh',
      date_refresh: currentDay(i),
    });
    const eventsResp = await requestData(eventsUrl, eventsQuery);
    await createEvents(eventsResp, currentDay(i));
  }
  delete requestedDays.week;
};

const requestData = (url, query) => new Promise((res, rej) => {
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
        await EventsData.findOneAndUpdate({ eventID }, { eventID, data }, { upsert: true });
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
