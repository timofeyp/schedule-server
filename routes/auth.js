const { error } = require('../utils');
const express = require('express');
const passport = require('passport');
const router = express.Router({});

const HttpStatus = require('http-status-codes');
const { User } = require('db');
const isAuth = require('routes/middlewares/check-authenticated');


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
router.post('/login-ldap', passport.authenticate('ldapauth', { session: true }), async (req, res) => {
  const { user } = req;
  const isAdminObjectKey = user.cn === 'asp-pts' || user.cn === 'asp-fsl' ? 'isAdmin' : null;
  const userData = {
    user: user.cn, company: user.company, departament: user.department, phone: user.telephoneNumber, title: user.title, name: user.displayName, mail: user.mail, [isAdminObjectKey]: !!isAdminObjectKey,
  };
  const userFromDb = await User.findOneAndUpdate({ user: user.cn }, userData, { upsert: true });
  return res.json(userFromDb);
});

router.get('/session', isAuth, async (req, res) => {
  const user = await User.findOne({ user: req.user });
  res.status(HttpStatus.OK).json(user);
});


router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
