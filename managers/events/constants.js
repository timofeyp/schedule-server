const eventsUrl = 'http://saprap.co.rosenergoatom.ru/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2frea!2fca!2fservices_ca!2ffRooms_booking!2frooms_request!2frequests!2ffRoom_requests!2fpScheduler!2fru.rea.i_day_rooms_requests';
const eventUrl = eventId => `http://saprap.co.rosenergoatom.ru/irj/servlet/prt/portal/prtroot/rea.ru~request~rooms~portal.RoomRequest?event_id=${eventId}`;
const portalUrl = 'http://a:a@saprap.co.rosenergoatom.ru/irj/portal';
const todayEventsRequestPeriod = 5 * 60 * 1000;
const weekEventsRequestPeriod = 20 * 60 * 1000;
const getCookiesPeriod = 24 * 60 * 60 * 1000;

module.exports = {
  eventsUrl, eventUrl, portalUrl, todayEventsRequestPeriod, weekEventsRequestPeriod, getCookiesPeriod,
};
