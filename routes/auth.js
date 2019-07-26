const { error } = require('../utils');
const express = require('express');
const passport = require('passport');
const router = express.Router({});

const HttpStatus = require('http-status-codes');
const User = require('../db/models/user');


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
router.post('/login-ldap', passport.authenticate('ldapauth', { session: false }), (req, res) => {
  const { user } = req;
  res.json(user);
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
