const { EventsNames, EventsData } = require('src/db');
const { ObjectId } = require('mongodb');

const getVCParts = async (req, res) => {
  const VCParts = await EventsData.aggregate(EventsData.getVCPartsQuery());
  return res.json(VCParts);
};

const getSelectedVcParts = async (req, res) => {
  const VCParts = await EventsData.aggregate(
    EventsData.getSelectedVCPartsQuery(),
  );
  return res.json(VCParts);
};

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

module.exports = {
  getNames,
  getEventData,
  getSelectedVcParts,
  getVCParts,
};
