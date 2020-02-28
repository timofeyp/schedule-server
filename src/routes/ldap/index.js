const express = require('express');
const router = express.Router({});
const { getUsers } = require('src/routes/ldap/handlers');
const isAuth = require('src/routes/middlewares/check-authenticated');

router.put('/users', isAuth, getUsers);

module.exports = router;
