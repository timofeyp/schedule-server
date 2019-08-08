const { Events, EventsData } = require('../../db');
const Moment = require('moment');

const getCurrentWeekEvents = async (req, res) => {
  const events = await Events.aggregate([
    {
      $match: {
        date: {
          $gte: Moment().hour(0).minute(0).toDate(),
          $lte: Moment().hour(23).minute(59).add(6, 'day').toDate(),
        },
      },
    }, {
      $unwind: {
        path: '$events',
      },
    }, {
      $lookup: {
        from: 'eventsdatas',
        localField: 'events.event_id',
        foreignField: 'eventID',
        as: 'data',
      },
    }, {
      $unwind: {
        path: '$data',
      },
    }, {
      $project: {
        data: '$data.data',
        event: '$events',
        date: 1,
      },
    }, {
      $group: {
        _id: {
          date: '$date',
        },
        data: {
          $push: {
            $mergeObjects: [
              '$data', '$event',
            ],
          },
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);
  return res.json(events);
};

const getEventData = async (req, res) => {
  const event = await EventsData.findOne({ eventID: req.params.id });
  return res.json(event);
};

module.exports = {
  getCurrentWeekEvents,
  getEventData,
};

