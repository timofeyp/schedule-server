const { EventsData } = require('src/db');
const { getDateWeek } = require('src/db/models/events-data/constants');
const { isEmpty } = require('lodash');
const log = require('src/utils/log')(module);

const findDoubles = events => {
  if (Array.isArray(events)) {
    const result = {};
    const checkEventDoubles = event =>
      checkDoubles(
        events,
        ['eventName', 'timeStart', 'timeEnd', 'yearMonthDay'],
        [event.eventName, event.timeStart, event.timeEnd, event.yearMonthDay],
      );
    events.forEach(event => {
      const isEventHaveDoubles = checkEventDoubles(event);
      const doublesKey = event.eventName + event.timeStart + event.timeEnd;
      if (!result[doublesKey] && isEventHaveDoubles) {
        result[doublesKey] = [event];
      } else if (isEventHaveDoubles) {
        result[doublesKey].push(event);
      }
    });
    return result;
  }
  return {};
};

const checkDoubles = (arr, keys, values) => {
  const isItemContainValue = (item, key, i) => item[key] === values[i];
  const isItemContainValues = item =>
    keys.every((key, i) => isItemContainValue(item, key, i));
  const countDoubles = arr.filter(item => isItemContainValues(item)).length;
  return countDoubles > 1;
};

const hideDoubles = async events => {
  for (const key in events) {
    if (+key > 0 && Object.prototype.hasOwnProperty.call(events, key)) {
      const { _id } = events[key];
      await EventsData.findOneAndUpdate({ _id }, { isHidden: true });
    }
  }
};

const handleDoubles = async () => {
  const events = await EventsData.find({
    dateStart: getDateWeek(),
    isUpdated: { $nin: [true] },
  });
  const doubles = findDoubles(events);
  if (!isEmpty(doubles) && doubles instanceof Object) {
    for (const key in doubles) {
      if (Object.prototype.hasOwnProperty.call(doubles, key)) {
        await hideDoubles(doubles[key]);
      }
    }
  }
  log.info('doubles hidden');
};

module.exports = handleDoubles;
