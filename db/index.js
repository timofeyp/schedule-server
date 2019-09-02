const User = require('./models/user');
const Admin = require('./models/admin');
const Events = require('./models/events');
const EventsData = require('./models/eventsData');
const VCParts = require('./models/VCParts');
const VCPartsCategory = require('./models/VCPartsCategory');
const LocalConfirmations = require('./models/localConfirmations');

module.exports = {
  User, Admin, Events, EventsData, VCParts, VCPartsCategory, LocalConfirmations,
};
