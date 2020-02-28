const { ObjectId } = require('mongodb');
const confirmedUsersLookupQuery = require('src/db/models/events-data/confirmed-users-lookup-query');
const VCPartsQuery = require('src/db/models/events-data/v-c-parts-lookup-query');

module.exports = req => {
  const pipeline = [
    {
      $match: {
        // eslint-disable-next-line radix
        _id: ObjectId(req.params.id),
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
                    $eq: ['$$item.userID', req.user && req.user._id],
                  },
                ],
              },
            },
          },
        },
      },
    },
  ];
  if (req.user && req.user.isAdmin) {
    pipeline.push(confirmedUsersLookupQuery);
  }

  return pipeline;
};
