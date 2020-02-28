const users = require('src/routes/users');
const auth = require('src/routes/auth');
const events = require('src/routes/events');
const ldap = require('src/routes/ldap');
const VCParts = require('src/routes/v-c-parts');

module.exports = app => {
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/events', events);
  app.use('/api/ldap', ldap);
  app.use('/api/v-c-parts', VCParts);
};
