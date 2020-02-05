const {
  EventsData, EventsNames, LocalConfirmations,
} = require('src/db');
const Moment = require('moment');
const parseQuery = require('src/utils/parseIntQuery');
const { ObjectId } = require('mongodb');

const unixWeek = () => ({
  $gte: (Moment().hour(0).minute(0).second(0).millisecond(0).unix() * 1000),
  $lte: (Moment().hour(23).minute(59).second(59).add(6, 'day').unix() * 1000),
});

const week = () => ({
  $gte: Moment().hour(0).minute(0).second(0).millisecond(0).toDate(),
  $lte: Moment().hour(23).hour(23).minute(59).second(59).add(6, 'day').toDate(),
});

const populateConfirmedUsers = {
  $lookup: {
    from: 'localconfirmations',
    let: {
      eventID: '$_id',
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
          localField: 'userID',
          foreignField: '_id',
          as: 'user',
        },
      }, {
        $unwind: '$user',
      },
    ],
    as: 'confirms',
  },
};


const getCurrentWeekEvents = async (req, res) => {
  const params = req.user && req.user.isAdmin ? populateConfirmedUsers : { $match: { isHidden: { $nin: [true] } } };
  const { filter, isVideo, isLocal } = parseQuery(req.query);

  let match = {};
  if (filter && isVideo) {
    const matchVCPartsIDs = {
      VCPartsIDs: {
        $in: filter instanceof Array ? filter.map(e => +e) : [+filter],
      },
    };
    match = { ...match, ...matchVCPartsIDs };
  }
  if (isVideo) {
    match = { ...match, isVideo };
  }
  if (isLocal) {
    match = { ...match, isLocal };
  }

  const events = await EventsData.aggregate([
    {
      $match: {
        dateStart: week(),
        isLocal,
      },
    }, {
      $match: match,
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
      $addFields: {
        confirmed: {
          $anyElementTrue: {
            $filter: {
              input: '$confirmed',
              as: 'item',
              cond: {
                $and: [
                  {
                    $eq: [
                      '$$item.eventID', '$_id',
                    ],
                  }, {
                    $eq: [
                      '$$item.user', req.user && req.user._id,
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
      $sort: {
        dateStart: -1,
        dateTimeStart: 1,
        dateTimeEnd: 1,
        _id: 1,
      },
    },
  ]);
  return res.json(events);
};

const getEventData = async (req, res) => {
  const populateConfirms = req.user && req.user.isAdmin ? populateConfirmedUsers : {};
  const event = req.isAuthenticated() ? await EventsData.aggregate([
    {
      $match: {
        // eslint-disable-next-line radix
        _id: ObjectId(req.params.id),
      },
    }, {
      $lookup: {
        from: 'localconfirmations',
        localField: 'confirmed',
        foreignField: 'confirmed',
        as: 'confirmed',
      },
    }, {
      $addFields: {
        confirmed: {
          $anyElementTrue: {
            $filter: {
              input: '$confirmed',
              as: 'item',
              cond: {
                $and: [
                  {
                    $eq: [
                      '$$item.eventID', '$_id',
                    ],
                  }, {
                    $eq: [
                      '$$item.userID', req.user && req.user._id,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
    populateConfirms,
  ]) : await EventsData.find({
    // eslint-disable-next-line radix
    _id: ObjectId(req.params.id),
  });
  if (event) {
    return res ? res.json(event[0]) : event[0];
  }
  return {};
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

const updateEvent = async (req, res) => {
  const { _id } = req.body;
  req.params.id = _id;
  delete req.body._id;
  await EventsData.findOneAndUpdate({ _id: ObjectId(_id) }, req.body, { new: true });
  const event = await getEventData(req);
  return res.json(event);
};

const createEvent = async (req, res) => {
  const event = await EventsData.create({ ...req.body, isHidden: !req.user.isAdmin });
  if (!req.user.isAdmin) {
    await LocalConfirmations.findOneAndUpdate({ eventID: event._id, userID: req.user._id }, {
      eventID: event._id, user: req.user._id, date: Moment().utc(true).toISOString(),
    }, { upsert: true });
  }
  const { eventName: name } = req.body;
  const pattern = name.replace(/[^A-zА-я0-9\s]/gmi, '\\W');
  await EventsNames.findOneAndUpdate({ name: { $regex: new RegExp(pattern, 'i') } }, { name }, { upsert: true });
  res.json(event);
};

module.exports = {
  getCurrentWeekEvents,
  getEventData,
  getSelectedVcParts,
  getVcParts,
  updateEvent,
  createEvent,
};
