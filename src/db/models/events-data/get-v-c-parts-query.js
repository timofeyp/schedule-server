const { unixWeek } = require('src/db/models/events-data/constants');

module.exports = () => [
  {
    $match: {
      'data.date_start': unixWeek,
    },
  },
  {
    $project: {
      vc_parts: '$data.vc_parts',
    },
  },
  {
    $unwind: {
      path: '$vc_parts',
    },
  },
  {
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
];
