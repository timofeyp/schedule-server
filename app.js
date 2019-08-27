const express = require('express');
const passport = require('passport');
const LdapStrategy = require('passport-ldapauth');
const config = require('config');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const HttpStatus = require('http-status-codes');
const mongoose = require('./utils/mongoose');
const app = express();
const eventsInitialization = require('./managers/events');
const routes = require('./routes');

const ldapCfg = {
  usernameField: 'username',
  passwordField: 'password',
  handleErrorsAsFailures: true,
  missingCredentialsStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  server: {
    url: 'ldap://10.3.6.26:389',
    bindDN: 'CN=сuadmin,CN=Users,DC=ln,DC=rosenergoatom,DC=ru',
    bindCredentials: '1QAZse4',
    searchBase: 'OU=laes.ru,DC=ln,DC=rosenergoatom,DC=ru',
    searchFilter: '(name={{username}})',
  },
};

expressInitialization();
passportInitialization();
routesInitialization();
errorHandlersInitialization();
eventsInitialization();

module.exports = app;

function expressInitialization() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(session({
    secret: config.get('session.secret'),
    key: config.get('session.key'),
    resave: config.get('session.resave'),
    saveUninitialized: config.get('session.saveUninitialized'),
    cookie: config.get('session.cookie'),
    rolling: config.get('session.rolling'),
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      stringify: false,
    }),
  }));
}

function passportInitialization() {
  app.use(passport.initialize());
  app.use(passport.session());

  // passport config
  passport.use(new LdapStrategy(ldapCfg, ((user, done) => {
    if (user.cn === 'asp-pts') {
      return done(null, user);
    }
    return done(null, null);
  })));
  // passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser((user, done) => {
    done(null, user.cn);
  });
  passport.deserializeUser((id, done) => {
    done(null, id);
    return null;
  });
}

function routesInitialization() {
  // Add endpoints to app
  routes(app);
}

function errorHandlersInitialization() {
  // catch 404 and forward to error handler
  app.use(() => HttpStatus.NOT_FOUND);

  // error handler
  app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    return res.sendStatus(err.status || HttpStatus.INTERNAL_SERVER_ERROR);
  });
}
