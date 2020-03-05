const confirmedUsersLookupQuery = {
  $lookup: {
    from: 'local-confirmations',
    let: {
      eventID: '$_id',
    },
    pipeline: [
      {
        $match: {
          $expr: {
            $eq: ['$eventID', '$$eventID'],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userID',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ],
    as: 'confirms',
  },
};

module.exports = confirmedUsersLookupQuery;
