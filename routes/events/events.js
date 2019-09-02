const {
  EventsData,
} = require('../../db');
const Moment = require('moment');

const unixWeek = {
  $gte: (Moment().hour(0).minute(0).second(0).millisecond(0).unix() * 1000),
  $lte: (Moment().hour(23).minute(59).second(59).add(6, 'day').unix() * 1000),
};

const week = {
  $gte: Moment().hour(0).minute(0).second(0).millisecond(0).toDate(),
  $lte: Moment().hour(23).minute(59).second(59).add(6, 'day').toDate(),
};

const getCurrentWeekEvents = async (req, res) => {
  const filter = req.body.filter ? {
    VCPartsIDs: {
      $in: req.body.filter,
    },
  } : {};
  const events = await EventsData.aggregate([
    {
      $match: {
        dateStart: week,
      },
    }, {
      $match: filter,
    }, {
      $group: {
        _id: '$yearMonthDay',
        events: {
          $addToSet: '$$ROOT',
        },
      },
    }, {
      $sort: {
        _id: 1,
      },
    },
  ]);
  return res.json(events);
};

const getEventData = async (req, res) => {
  const event = await EventsData.findOne({
    // eslint-disable-next-line radix
    eventID: parseInt(req.params.id),
  });
  return res.json(event);
};

const getSelectedVcParts = async (req, res) => {
  const vcParts = await EventsData.aggregate([
    {
      $match: {
        'data.date_start': unixWeek,
      },
    }, {
      $project: {
        vc_parts: '$data.vc_parts',
        selected_vc_parts: '$data.selected_vc_parts',
      },
    }, {
      $unwind: {
        path: '$vc_parts',
      },
    }, {
      $group: {
        _id: '$vc_parts.group_id',
        group_name: {
          $first: '$vc_parts.group_name',
        },
        s: {
          $addToSet: {
            $filter: {
              input: '$vc_parts.vc_parts',
              as: 'vc_part',
              cond: {
                $in: [
                  '$$vc_part.id', {
                    $map: {
                      input: '$selected_vc_parts',
                      as: 'item',
                      in: {
                        $convert: {
                          input: '$$item',
                          to: 'int',
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    }, {
      $unwind: {
        path: '$s',
      },
    }, {
      $unwind: {
        path: '$s',
      },
    }, {
      $group: {
        _id: '$_id',
        group_name: {
          $first: '$group_name',
        },
        vc_parts: {
          $addToSet: { value: '$s.id', label: '$s.name' },
        },
      },
    },
  ]);
  return res.json(vcParts);
};

const getVcParts = async (req, res) => {
  const vcParts = await EventsData.aggregate([
    {
      $match: {
        'data.date_start': unixWeek,
      },
    }, {
      $project: {
        vc_parts: '$data.vc_parts',
      },
    }, {
      $unwind: {
        path: '$vc_parts',
      },
    }, {
      $group: {
        _id: '$vc_parts.group_id',
        group_name: {
          $first: '$vc_parts.group_name',
        },
        vc_parts: {
          $first: '$vc_parts.vc_parts',
        },
      },
    },
  ]);

  return res.json(vcParts);
};

module.exports = {
  getCurrentWeekEvents,
  getEventData,
  getSelectedVcParts,
  getVcParts,
};

