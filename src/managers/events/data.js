const { EventsData } = require('src/db');
const updateEventNames = require('src/managers/events/utils/update-events-names');
const storeVCParts = require('src/managers/events/utils/store-v-c-parts');
const { requestData } = require('src/managers/events/utils/request-data');
const {
  eventUrl,
  requestEventsDataPause,
} = require('src/managers/events/constants');
const queryString = require('query-string');
const getDateTime = require('src/managers/events/utils/get-date-time');

class DataManager {
  constructor() {
    this.pausedEvents = {};
  }

  resetEventsPause(day) {
    delete this.pausedEvents[day];
  }

  async requestEventsData(events, day) {
    const query = queryString.stringify({
      action: 'initStartParams',
    });
    if (!this.pausedEvents[day]) {
      this.pausedEvents[day] = true;
      for (const event of events) {
        const { event_id: eventID } = event;
        const data = await requestData(eventUrl(eventID), query);
        await storeVCParts(data.vc_parts);
        const item = await this.prepareEventItem(data, eventID);
        await EventsData.findOneAndUpdate({ eventID }, item, { upsert: true });
      }
      setTimeout(() => this.resetEventsPause(day), requestEventsDataPause);
    }
  }

  async prepareEventItem(data, eventID) {
    await updateEventNames(data.event_name);
    const room = data.rooms
      ? data.rooms.filter(el => el.id === data.selected_room)
      : [];
    // eslint-disable-next-line radix
    const VCPartsIDs = data.selected_vc_parts
      ? data.selected_vc_parts.map(el => parseInt(el, 10))
      : [];
    const {
      dateStart,
      dateTimeStart,
      dateTimeEnd,
      yearMonthDay,
      timeStart,
      timeEnd,
    } = getDateTime(data);
    return {
      eventID,
      room: room[0],
      eventName: data.event_name,
      dateStart,
      dateTimeStart,
      dateTimeEnd,
      VCPartsIDs,
      responsibleDept: data.responsible_dept,
      responsibleDisplayname: data.responsible_displayname,
      ownerDisplayname: data.owner_displayname,
      chairman: data.chairman_displayname,
      presentation: data.presentation,
      yearMonthDay,
      timeStart,
      timeEnd,
      additional: data.reqaddpart,
      isVideo: true,
    };
  }
}

module.exports = DataManager;
