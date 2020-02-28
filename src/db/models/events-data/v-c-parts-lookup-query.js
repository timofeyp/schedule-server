module.exports = {
  $lookup: {
    from: 'v-c-parts',
    let: {
      ids: '$VCPartsIDs',
    },
    pipeline: [
      {
        $match: {
          $expr: {
            $in: ['$id', '$$ids'],
          },
        },
      },
      {
        $group: {
          _id: '$groupId',
          groupName: {
            $first: '$groupName',
          },
          VCParts: {
            $push: '$$ROOT',
          },
        },
      },
    ],
    as: 'VCParts',
  },
};
