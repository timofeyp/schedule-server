const { dateWeek } = require('src/db/models/events-data/constants');

module.exports = () => [
  {
    $match: {
      dateStart: dateWeek,
    },
  },
  {
    $project: {
      VCPartsIDs: 1,
    },
  },
  {
    $unwind: {
      path: '$VCPartsIDs',
    },
  },
  {
    $group: {
      _id: '$VCPartsIDs',
    },
  },
  {
    $addFields: {
      VCPartsID: '$_id',
    },
  },
  {
    $lookup: {
      from: 'v-c-parts',
      localField: 'VCPartsID',
      foreignField: 'id',
      as: 'object',
    },
  },
  {
    $project: {
      object: 1,
    },
  },
  {
    $unwind: {
      path: '$object',
    },
  },
  {
    $project: {
      label: '$object.name',
      value: '$object.id',
    },
  },
  {
    $sort: {
      label: 1,
    },
  },
];
