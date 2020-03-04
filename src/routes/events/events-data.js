const { EventsNames, EventsData } = require('src/db');
const { ObjectId } = require('mongodb');

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
  const event = await EventsData.aggregate(EventsData.getEventDataQuery(req));
  return res.json(event[0]);
};

module.exports = {
  getNames,
  getEventData,
  localAcceptEvent,
};
