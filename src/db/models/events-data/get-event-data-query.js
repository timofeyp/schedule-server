const { ObjectId } = require('mongodb');

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
