const users = require('./users');
const auth = require('./auth');
const events = require('./events');
module.exports = (app) => {
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use('/api/events', events);
};
