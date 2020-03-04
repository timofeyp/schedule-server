const { dateWeek } = require('src/db/models/events-data/constants');
const confirmedUsersLookupQuery = require('src/db/models/events-data/confirmed-users-lookup-query');
const VCPartsQuery = require('src/db/models/events-data/v-c-parts-lookup-query');
const parseQuery = require('src/utils/parse-get-query');

const getConcernEventMatchQuery = (filter, isConcern) => {
  if (filter && isConcern) {
    const matchVCPartsIDs = {
      VCPartsIDs: {
        $in: filter instanceof Array ? filter.map(e => +e) : [+filter],
      },
    };
    return {
      ...matchVCPartsIDs,
      isVideo: true,
      isLocal: { $nin: [true] },
    };
  }
  return { isLocal: { $nin: [true] } };
};

const getMatchQuery = req => {
  const isAdmin = req.user && req.user.isAdmin;
  const { filter, isConcern, isLocal } = parseQuery(req.query);
  const concernEventMatchQuery = getConcernEventMatchQuery(filter, isConcern);
  const matchByEventsType = isLocal ? { isLocal } : concernEventMatchQuery;
  const matchByUserType = isAdmin
    ? {}
    : { isHidden: { $nin: [true] }, isPendingForAccept: { $nin: [true] } };
  return { ...matchByEventsType, ...matchByUserType };
};

const sortQuery = {
  $sort: {
    dateStart: 1,
    dateTimeStart: 1,
    dateTimeEnd: 1,
    _id: 1,
  },
};

module.exports = req => {
  const isAdmin = req.user && req.user.isAdmin;
  const userId = req.user && req.user._id;
  const pipeline = [
    {
      $match: {
        dateStart: dateWeek,
        ...getMatchQuery(req),
      },
    },
    {
      $lookup: {
        from: 'local-confirmations',
        localField: 'confirmed',
        foreignField: 'confirmed',
        as: 'confirmed',
      },
    },
    VCPartsQuery,
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
                    $eq: ['$$item.eventID', '$_id'],
                  },
                  {
                    $eq: ['$$item.user', userId],
                  },
                ],
              },
            },
          },
        },
      },
    },
  ];
  if (isAdmin) {
    pipeline.push(confirmedUsersLookupQuery);
  }
  pipeline.push(sortQuery);

  return pipeline;
};
