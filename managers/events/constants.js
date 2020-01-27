const eventsUrl = 'http://saprap.co.rosenergoatom.ru/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2frea!2fca!2fservices_ca!2ffRooms_booking!2frooms_request!2frequests!2ffRoom_requests!2fpScheduler!2fru.rea.i_day_rooms_requests';
const eventUrl = eventId => `http://saprap.co.rosenergoatom.ru/irj/servlet/prt/portal/prtroot/rea.ru~request~rooms~portal.RoomRequest?event_id=${eventId}`;
const portalUrl = 'http://a:a@saprap.co.rosenergoatom.ru/irj/portal';
const todayEventsRequestPeriod = 5 * 60 * 1000;
const weekEventsRequestPeriod = 21 * 60 * 1000;
const setCookiesPeriod = 24 * 60 * 60 * 1000;
const requestEventsDataPause = 20 * 60 * 1000;
const increaseDaysArray = [...Array(7).keys()];
increaseDaysArray.shift();
const requestHeaders = {
  'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  accept: 'text/plain, */*; q=0.01',
  'x-requested-with': 'XMLHttpRequest',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.90 Safari/537.36',
};
const portalLogin = 'asp-pts@ln.rosenergoatom.ru';
const portalPass = 'defender';

module.exports = {
  eventsUrl,
  eventUrl,
  portalUrl,
  portalLogin,
  portalPass,
  todayEventsRequestPeriod,
  weekEventsRequestPeriod,
  setCookiesPeriod,
  increaseDaysArray,
  requestHeaders,
  requestEventsDataPause,
};
