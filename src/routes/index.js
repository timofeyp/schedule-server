const users = require('src/routes/users');
const auth = require('src/routes/auth');
const events = require('src/routes/events');

module.exports = (app) => {
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/events', events);
};
