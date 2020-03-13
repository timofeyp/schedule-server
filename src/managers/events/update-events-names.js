const { EventsNames } = require('src/db');

module.exports = async eventName => {
  const pattern = eventName.replace(/[^A-zА-я0-9\s]/gim, '\\W');
  await EventsNames.findOneAndUpdate(
    { name: { $regex: new RegExp(pattern, 'i') } },
    { name: eventName },
    { upsert: true },
  );
};
