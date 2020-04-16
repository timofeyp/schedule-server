const User = require('src/db/models/user');
const Admin = require('src/db/models/admin');
const Events = require('src/db/models/events');
const EventsData = require('src/db/models/events-data');
const VCParts = require('src/db/models/v-c-parts');
const LocalConfirmations = require('src/db/models/local-confirmations');
const EventsNames = require('src/db/models/events-names');
const Responses = require('src/db/models/responses');

module.exports = {
  User,
  Admin,
  Events,
  EventsData,
  VCParts,
  LocalConfirmations,
  EventsNames,
  Responses,
};
