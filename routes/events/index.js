const express = require('express');
const router = express.Router({});
const {
  getCurrentWeekEvents, getEventData, getSelectedVcParts, getVcParts, getCurrentWeekEventsAdmin, updateEvent,
} = require('./events');
const {
  localConfirmEvent,
} = require('./eventsConfirmations');
const isAuth = require('routes/middlewares/check-authenticated');
const isAdmin = require('routes/middlewares/check-authenticated');

router.post('/get-week', getCurrentWeekEvents);
router.post('/get-week-admin', isAuth, isAdmin, getCurrentWeekEventsAdmin);
router.put('/update', isAuth, isAdmin, updateEvent);
router.get('/get-event-data/:id', getEventData);
router.get('/get-selected-vc-parts', getSelectedVcParts);
router.get('/get-vc-parts', getVcParts);
router.get('/local-confirm-event/:id', isAuth, localConfirmEvent);

module.exports = router;
