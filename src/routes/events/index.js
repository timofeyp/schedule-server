const express = require('express');
const router = express.Router({});
const {
  getCurrentWeekEvents,
  updateEvent,
  createEvent,
} = require('src/routes/events/events');
const {
  getEventData,
  getSelectedVcParts,
  getVCParts,
} = require('src/routes/events/events-data');
const { localConfirmEvent } = require('src/routes/events/events-confirmations');
const { getNames } = require('src/routes/events/events-data');
const isAuth = require('src/routes/middlewares/check-authenticated');
const isAdmin = require('src/routes/middlewares/check-authenticated');

router.get('/get-week', getCurrentWeekEvents);
router.put('/update', isAuth, isAdmin, updateEvent);
router.post('/create', isAuth, createEvent);
router.get('/get-event-data/:id', getEventData);
router.get('/get-selected-vc-parts', getSelectedVcParts);
router.get('/get-vc-parts', getVCParts);
router.put('/local-confirm-event/:id', isAuth, localConfirmEvent);
router.get('/names/:name', getNames);

module.exports = router;
