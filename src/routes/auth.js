const { error } = require('src/utils');
const express = require('express');
const passport = require('passport');
const router = express.Router({});

const HttpStatus = require('http-status-codes');
const { User } = require('src/db');
const isAuth = require('src/routes/middlewares/check-authenticated');

router.post('/register', (req, res) => {
  const local = passport.authenticate('local');
  const cb = err => {
    if (err) {
      error(res, 'No username was given', HttpStatus.BAD_REQUEST);
      res.end();
    } else {
      local(req, res, () => res.redirect('/'));
    }
  };
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    cb,
  );
});

router.post('/login', passport.authenticate('local'), (req, res) =>
  res.redirect('/'),
);
router.post(
  '/login-ldap',
  passport.authenticate('ldapauth', { session: true }),
  async (req, res) => {
    const { user } = req;
    const userDocument = await User.findOne({ login: user.cn });
    return res.send(userDocument);
  },
);

router.get('/session', isAuth, async (req, res) => {
  let user = await User.findOne({ login: req.user.login });
  user = user.toObject();
  delete res.status(HttpStatus.OK).json(user);
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
