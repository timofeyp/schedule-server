const { Events, EventsData } = require('src/db');
const { isEmpty, difference } = require('lodash');

const findEvents = async date => {
  const actualEventsDocument = await Events.findOne({ date });
  const currentEventsDocuments = await EventsData.find({ yearMonthDay: date });
  if (actualEventsDocument && currentEventsDocuments) {
    const actualEvents = actualEventsDocument.toObject().events;
    const currentEvents = currentEventsDocuments.map(event => event.toObject());
    await markEvents(actualEvents, currentEvents);
  }
};

const markEvents = async (actualEvents, currentEvents) => {
  const isPossiblyEventsToMark =
    !isEmpty(actualEvents) && !isEmpty(currentEvents);
  if (isPossiblyEventsToMark) {
    const actualEventsIds = actualEvents.map(event => event.event_id);
    const currentEventsIds = currentEvents.map(event => event.eventID);
    const notActualEvents = difference(currentEventsIds, actualEventsIds);
    await EventsData.updateMany(
      { eventID: { $in: notActualEvents } },
      { isPossiblyCanceled: true },
    );
  }
};

module.exports = findEvents;
