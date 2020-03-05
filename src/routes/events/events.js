const { EventsData } = require('src/db');
const { isEmpty } = require('lodash');
const updateEventNames = require('src/managers/events/update-events-names');
const { localConfirmEvent } = require('src/routes/events/events-confirmations');
const { getEventData } = require('src/routes/events/events-data');
const createEwsEvents = require('src/managers/ews');
const { ObjectId } = require('mongodb');

const getCurrentWeekEvents = async (req, res) => {
  const pipeline = EventsData.getWeekEventsQuery(req);
  const events = await EventsData.aggregate(pipeline);
  return res.json(events);
};

const updateEvent = async (req, res) => {
  const { _id } = req.body;
  req.params.id = _id;
  delete req.body._id;
  await EventsData.findOneAndUpdate(
    { _id: ObjectId(_id) },
    { ...req.body, isUpdated: true },
    { new: true },
  );
  const event = await getEventData(req);
  return res.json(event);
};

const createEvent = async (req, res) => {
  const { isAdmin, _id: ownerUserId } = req.user;
  const { eventName, ldapParts } = req.body;
  const event = await EventsData.create({
    ...req.body,
    isUpdated: true,
    isManualCreated: true,
    ownerUserId,
    isPendingForAccept: !isAdmin,
  });
  req.params = { id: event._id };
  const [result] = await EventsData.aggregate(
    EventsData.getEventDataQuery(req),
  );
  const isEws = !isEmpty(ldapParts) && isAdmin;
  if (isEws) {
    await createEwsEvents(event);
  }
  if (!isAdmin) {
    await localConfirmEvent(req);
  }
  await updateEventNames(eventName);
  res.json(result);
};

module.exports = {
  getCurrentWeekEvents,
  getEventData,
  updateEvent,
  createEvent,
};
