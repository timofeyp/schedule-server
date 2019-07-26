const { Events } = require('../../db');
const getCurrentWeekEvents = async (req, res) => {
  const events = await Events.aggregate([
    {
      $match: {
        $or: [
          {
            date: '24.07.2019',
          }, {
            date: '25.07.2019',
          },
        ],
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
  ]);
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  return res.json(events);
};

module.exports = {
  getCurrentWeekEvents,
};
