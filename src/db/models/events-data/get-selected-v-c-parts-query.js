const { dateWeek } = require('src/db/models/events-data/constants');

module.exports = () => [
  {
    $match: {
      dateStart: dateWeek,
    },
  },
  {
    $project: {
      VCParts: 1,
    },
  },
  {
    $unwind: {
      path: '$VCParts',
      preserveNullAndEmptyArrays: false,
    },
  },
  {
    $unwind: {
      path: '$VCParts.VCParts',
    },
  },
  {
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
  },
  {
    $unwind: {
      path: '$vc_parts',
    },
  },
  {
    $project: {
      value: '$vc_parts.value',
      label: '$vc_parts.label',
    },
  },
  {
    $sort: {
      label: 1,
    },
  },
];
