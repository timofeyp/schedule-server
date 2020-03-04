const { EventsData, EventsNames } = require('src/db');
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
  const event = await EventsData.create({
    ...req.body,
    isUpdated: true,
    isManualCreated: true,
    isPendingForAccept: !req.user.isAdmin,
  });
  if (req.body && req.body.ldapUsers) {
    await createEwsEvents(req);
  }
  if (req.user && !req.user.isAdmin) {
    req.params = { id: event._id };
    await localConfirmEvent(req);
  }
  const { eventName: name } = req.body;
  const pattern = name.replace(/[^A-zА-я0-9\s]/gim, '\\W');
  await EventsNames.findOneAndUpdate(
    { name: { $regex: new RegExp(pattern, 'i') } },
    { name },
    { upsert: true },
  );
  res.json(event);
};

module.exports = {
  getCurrentWeekEvents,
  getEventData,
  updateEvent,
  createEvent,
};
