const { EventsNames, EventsData } = require('src/db');
const { ObjectId } = require('mongodb');
const createEwsEvents = require('src/managers/ews');

const getEventData = async (req, res) => {
  const event = req.isAuthenticated()
    ? await EventsData.aggregate(EventsData.getEventDataQuery(req))
    : await EventsData.find({ _id: ObjectId(req.params.id) });
  if (event) {
    return res ? res.json(event[0]) : event[0];
  }
  return {};
};

const getNames = async (req, res) => {
  const { name } = req.params;
  const names = await EventsNames.find({
    name: { $regex: new RegExp(`${name}`, 'i') },
  }).limit(10);
  return res.json(names);
};

const localAcceptEvent = async (req, res) => {
  const { id } = req.params;
  await EventsData.findOneAndUpdate(
    { _id: ObjectId(id) },
    {
      isPendingForAccept: false,
    },
  );
  const [event] = await EventsData.aggregate(EventsData.getEventDataQuery(req));
  const { ldapParts } = event;
  if (ldapParts) {
    await createEwsEvents(event);
  }
  return res.send(event);
};

module.exports = {
  getNames,
  getEventData,
  localAcceptEvent,
};
