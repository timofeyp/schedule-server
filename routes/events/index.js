const express = require('express');
const router = express.Router({});
const { getCurrentWeekEvents, getEventData } = require('./events');

router.get('/get-week', getCurrentWeekEvents);
router.get('/get-event-data/:id', getEventData);

module.exports = router;
