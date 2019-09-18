const {
  EventsData,
} = require('../../db');
const Moment = require('moment');
const HttpStatus = require('http-status-codes');

const unixWeek = () => ({
  $gte: (Moment().hour(0).minute(0).second(0).millisecond(0).unix() * 1000),
  $lte: (Moment().hour(23).minute(59).second(59).add(6, 'day').unix() * 1000),
});

const week = () => ({
  $gte: Moment().hour(0).minute(0).second(0).millisecond(0).toDate(),
  $lte: Moment().hour(23).minute(59).second(59).add(6, 'day').toDate(),
});

const getCurrentWeekEventsAdmin = async (req, res) => {
  const populate = {
    $lookup: {
      from: 'localconfirmations',
      let: {
        eventID: '$eventID',
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: [
                '$eventID', '$$eventID',
              ],
            },
          },
        }, {
          $lookup: {
            from: 'users',
            let: {
              user: '$user',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      '$$user', '$user',
                    ],
                  },
                },
              },
            ],
            as: 'user',
          },
        }, {
          $unwind: {
            path: '$user',
          },
        },
      ],
      as: 'confirms',
    },
  };
  const events = await getCurrentWeekEvents(req, res, { populate });
  return res.json(events);
};


const getCurrentWeekEvents = async (req, res, ...args) => {
  const params = args[0].populate ? args[0].populate : { $match: {} };
  const filter = req.body.filter ? {
    VCPartsIDs: {
      $in: req.body.filter,
    },
  } : {};
  const events = await EventsData.aggregate([
    {
      $match: {
        dateStart: week(),
      },
    }, {
      $match: filter,
    },
    {
      $lookup: {
        from: 'localconfirmations',
        localField: 'confirmed',
        foreignField: 'confirmed',
        as: 'confirmed',
      },
    },
    {
      $project: {
        eventID: 1,
        VCParts: 1,
        VCPartsIDs: 1,
        additional: 1,
        chairman: 1,
        dateStart: 1,
        eventName: 1,
        ownerDisplayname: 1,
        presentation: 1,
        responsibleDept: 1,
        responsibleDisplayname: 1,
        room: 1,
        timeEnd: 1,
        timeStart: 1,
        yearMonthDay: 1,
        confirmed: {
          $anyElementTrue: {
            $filter: {
              input: '$confirmed',
              as: 'item',
              cond: {
                $and: [
                  {
                    $eq: [
                      '$$item.eventID', '$eventID',
                    ],
                  }, {
                    $eq: [
                      '$$item.user', req.user,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
    params,
    {
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
  return args[0].populate ? events : res.json(events);
};

const getEventData = async (req, res) => {
  if (req.isAuthenticated()) {
    const event = await EventsData.aggregate([
      {
        $match: {
          // eslint-disable-next-line radix
          eventID: parseInt(req.params.id),
        },
      }, {
        $lookup: {
          from: 'localconfirmations',
          localField: 'confirmed',
          foreignField: 'confirmed',
          as: 'confirmed',
        },
      }, {
        $project: {
          eventID: 1,
          VCParts: 1,
          VCPartsIDs: 1,
          additional: 1,
          chairman: 1,
          dateStart: 1,
          eventName: 1,
          ownerDisplayname: 1,
          presentation: 1,
          responsibleDept: 1,
          responsibleDisplayname: 1,
          room: 1,
          timeEnd: 1,
          timeStart: 1,
          yearMonthDay: 1,
          confirmed: {
            $anyElementTrue: {
              $filter: {
                input: '$confirmed',
                as: 'item',
                cond: {
                  $and: [
                    {
                      $eq: [
                        '$$item.eventID', '$eventID',
                      ],
                    }, {
                      $eq: [
                        '$$item.user', req.user,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ]);
    return event ? res.json(event[0]) : res.json({});
  }
  const event = await EventsData.findOne({
    // eslint-disable-next-line radix
    eventID: parseInt(req.params.id),
  });
  return event ? res.json(event) : res.json({});
};

const getSelectedVcParts = async (req, res) => {
  const vcParts = await EventsData.aggregate([
    {
      $match: {
        dateStart: week(),
      },
    },
    {
      $project: {
        VCParts: 1,
      },
    }, {
      $unwind: {
        path: '$VCParts',
        preserveNullAndEmptyArrays: false,
      },
    }, {
      $unwind: {
        path: '$VCParts.VCParts',
      },
    }, {
      $group: {
        _id: '$VCParts.groupName',
        group_name: {
          $first: '$VCParts.groupName',
        },
        vc_parts: {
          $addToSet: {
            value: '$VCParts.VCParts.id',
            label: '$VCParts.VCParts.name',
          },
        },
      },
    }, {
      $unwind: {
        path: '$vc_parts',
      },
    }, {
      $project: {
        value: '$vc_parts.value',
        label: '$vc_parts.label',
      },
    }, {
      $sort: {
        label: 1,
      },
    },
  ]);
  return res.json(vcParts);
};

const getVcParts = async (req, res) => {
  const vcParts = await EventsData.aggregate([
    {
      $match: {
        'data.date_start': unixWeek(),
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

const hideEvent = async (req, res) => {
  const { isHidden } = req.body;
  await EventsData.findOneAndUpdate({ user: req.user }, { isHidden });
  return res.sendStatus(HttpStatus.OK);
};

module.exports = {
  getCurrentWeekEvents,
  getCurrentWeekEventsAdmin,
  getEventData,
  getSelectedVcParts,
  getVcParts,
  hideEvent,
};

