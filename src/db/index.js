const User = require('src/db/models/user');
const Admin = require('src/db/models/admin');
const Events = require('src/db/models/events');
const EventsData = require('src/db/models/eventsData');
const VCParts = require('src/db/models/VCParts');
const VCPartsCategory = require('src/db/models/VCPartsCategory');
const LocalConfirmations = require('src/db/models/localConfirmations');
const EventsNames = require('src/db/models/eventsNames');
const Responses = require('src/db/models/responses');

module.exports = {
  User, Admin, Events, EventsData, VCParts, VCPartsCategory, LocalConfirmations, EventsNames, Responses,
};
