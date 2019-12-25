const express = require('express');
const router = express.Router({});
const {
  getCurrentWeekEvents, getEventData, getSelectedVcParts, getVcParts, updateEvent, createEvent,
} = require('routes/events/events');
const {
  localConfirmEvent,
} = require('routes/events/eventsConfirmations');
const {
  getNames,
} = require('routes/events/eventsData');
const isAuth = require('routes/middlewares/check-authenticated');
const isAdmin = require('routes/middlewares/check-authenticated');

router.get('/get-week', getCurrentWeekEvents);
router.put('/update', isAuth, isAdmin, updateEvent);
router.post('/create', isAuth, createEvent);
router.get('/get-event-data/:id', getEventData);
router.get('/get-selected-vc-parts', getSelectedVcParts);
router.get('/get-vc-parts', getVcParts);
router.get('/local-confirm-event/:id', isAuth, localConfirmEvent);
router.get('/names/:name', getNames);

module.exports = router;
