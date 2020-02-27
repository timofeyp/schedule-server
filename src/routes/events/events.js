const { EventsData, EventsNames, LocalConfirmations } = require('src/db');
const Moment = require('moment');
const { getEventData } = require('src/routes/events/events-data');
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
    isHidden: !req.user.isAdmin,
    isUpdated: true,
  });
  if (!req.user.isAdmin) {
    await LocalConfirmations.findOneAndUpdate(
      { eventID: event._id, userID: req.user._id },
      {
        eventID: event._id,
        user: req.user._id,
        date: Moment()
          .utc(true)
          .toISOString(),
      },
      { upsert: true },
    );
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
