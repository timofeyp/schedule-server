const { EventsData } = require('src/db');
const updateEventNames = require('src/managers/events/update-events-names');

const dataManager = {
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
        await storeVCParts(data.vc_parts);
        const item = await this.prepareEventItem(data, eventID);
        await EventsData.findOneAndUpdate({ eventID }, item, { upsert: true });
      }
      setTimeout(() => this.resetEventsPause(day), requestEventsDataPause);
    }
  },
  async prepareEventItem(data, eventID) {
    await updateEventNames(data.event_name);
    const room = data.rooms
      ? data.rooms.filter(el => el.id === data.selected_room)
      : [];
    const dateStart = Moment(data.date_start)
      .startOf('day')
      .utcOffset(3)
      .toDate();
    const dateTimeStart = Moment(data.date_start)
      .hours(data.HStart)
      .minutes(data.MStart)
      .utcOffset(3)
      .toDate();
    const dateTimeEnd = Moment(data.date_start)
      .hours(data.HEnd)
      .minutes(data.MEnd)
      .utcOffset(3)
      .toDate();
    // eslint-disable-next-line radix
    const VCPartsIDs = data.selected_vc_parts
      ? data.selected_vc_parts.map(el => parseInt(el, 10))
      : [];
    const yearMonthDay = Moment(dateStart).format('DD-MM-YYYY');
    const timeStart = `${data.HStart}:${
      data.MStart === 0 ? '00' : data.MStart
    }`;
    const timeEnd = `${data.HEnd}:${data.MEnd === 0 ? '00' : data.MEnd}`;
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
  },
};

module.exports = dataManager;
