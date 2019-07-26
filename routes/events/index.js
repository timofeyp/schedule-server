const express = require('express');
const router = express.Router({});
const { getCurrentWeekEvents } = require('./events');

router.get('/get-week', getCurrentWeekEvents);

module.exports = router;
