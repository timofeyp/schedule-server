const express = require('express');
const passport = require('passport');
const LdapStrategy = require('passport-ldapauth');
const config = require('config');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const HttpStatus = require('http-status-codes');
const mongoose = require('src/utils/mongoose');
const app = express();
const eventsInitialization = require('src/managers/events');
const { User } = require('src/db');
const routes = require('src/routes');

expressInitialization();
passportInitialization();
routesInitialization();
errorHandlersInitialization();
eventsInitialization();

module.exports = app;


function expressInitialization() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(morgan('dev'));
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
  passport.use(new LdapStrategy(config.get('LDAP'), ((user, done) => {
    if (user) {
      return done(null, user);
    }
    return done(null, null);
  })));
  passport.serializeUser(async (user, done) => {
    const userData = {
      login: user.cn, company: user.company, departament: user.department, phone: user.telephoneNumber, title: user.title, name: user.displayName, mail: user.mail,
    };
    const userFromDb = await User.findOneAndUpdate({ login: user.cn }, userData, { upsert: true, new: true });
    done(null, userFromDb.toObject());
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj);
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
