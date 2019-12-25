const {
  EventsNames,
} = require('db');

const getNames = async (req, res) => {
  const { name } = req.params;
  const names = await EventsNames.find({ name: { $regex: new RegExp(`${name}`, 'i') } }).limit(10);
  return res.json(names);
};

module.exports = {
  getNames,
};
