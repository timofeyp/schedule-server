const express = require('express');
const router = express.Router({});
const {
  getCurrentWeekEvents, getEventData, getSelectedVcParts, getVcParts, getCurrentWeekEventsAdmin, updateEvent, createEvent,
} = require('routes/events/events');
const {
  localConfirmEvent,
} = require('routes/events/eventsConfirmations');
const {
  getNames,
} = require('routes/events/eventsData');
const isAuth = require('routes/middlewares/check-authenticated');
const isAdmin = require('routes/middlewares/check-authenticated');

router.post('/get-week', getCurrentWeekEvents);
router.post('/get-week-admin', isAuth, isAdmin, getCurrentWeekEventsAdmin);
router.put('/update', isAuth, isAdmin, updateEvent);
router.post('/create', isAuth, isAdmin, createEvent);
router.get('/get-event-data/:id', getEventData);
router.get('/get-selected-vc-parts', getSelectedVcParts);
router.get('/get-vc-parts', getVcParts);
router.get('/local-confirm-event/:id', isAuth, localConfirmEvent);
router.get('/names/:name', getNames);

module.exports = router;
