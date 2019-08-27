const { error } = require('../utils');
const express = require('express');
const passport = require('passport');
const router = express.Router({});

const HttpStatus = require('http-status-codes');
const User = require('../db/models/user');
const isAuth = require('./middlewares/check-authenticated');


router.post('/register', (req, res) => {
  const local = passport.authenticate('local');
  const cb = (err) => {
    if (err) {
      error(res, 'No username was given', HttpStatus.BAD_REQUEST);
      res.end();
    } else {
      local(req, res, () => res.redirect('/'));
    }
  };
  User.register(new User({ username: req.body.username }), req.body.password, cb);
});

router.post('/login', passport.authenticate('local'), (req, res) => res.redirect('/'));
router.post('/login-ldap', passport.authenticate('ldapauth', { session: true }), (req, res) => {
  const { user } = req;
  res.json(user);
});

router.get('/session', isAuth, (req, res) => res.status(HttpStatus.OK));

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
