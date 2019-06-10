const express = require("express");
const passport = require('passport');
const config = require("config");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const HttpStatus = require("http-status-codes");
const User = require('./db/models/user');
const LocalStrategy = require('passport-local').Strategy;

const mongoose = require('./utils/mongoose');

const app = express();

expressInitialization();
passportInitialization();
routesInitialization();
errorHandlersInitialization();

module.exports = app;

function expressInitialization () {
	app.use(logger("dev"));
	app.use(express.json());
	app.use(express.urlencoded({extended: false}));
	app.use(cookieParser());
	app.use(session({
		secret:            config.get('session.secret'),
		key:               config.get('session.key'),
		resave:            config.get('session.resave'),
		saveUninitialized: config.get('session.saveUninitialized'),
		cookie:            config.get('session.cookie'),
		rolling:           config.get('session.rolling'),
		store:             new MongoStore({
			mongooseConnection: mongoose.connection,
			stringify:          false
		})
	}));
}

function passportInitialization () {
	app.use(passport.initialize());
	app.use(passport.session());

	// passport config
	passport.use(new LocalStrategy(User.authenticate()));
	passport.serializeUser(User.serializeUser());
	passport.deserializeUser(User.deserializeUser());
}

function routesInitialization () {
	// Add endpoints to app
	require('./routes')(app);
}

function errorHandlersInitialization () {
	// catch 404 and forward to error handler
	app.use(() => HttpStatus.NOT_FOUND);

	// error handler
	app.use((err, req, res, next) => {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get("env") === "development" ? err : {};

		// render the error page
		return res.sendStatus(err.status || HttpStatus.INTERNAL_SERVER_ERROR);
	});
}
