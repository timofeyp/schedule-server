const express = require('express');
const router = express.Router({});
const {
  getCurrentWeekEvents, getEventData, getSelectedVcParts, getVcParts,
} = require('./events');
const {
  localConfirmEvent,
} = require('./eventsConfirmations');
const isAuth = require('../middlewares/check-authenticated');

router.post('/get-week', getCurrentWeekEvents);
router.get('/get-event-data/:id', getEventData);
router.get('/get-selected-vc-parts', getSelectedVcParts);
router.get('/get-vc-parts', getVcParts);
router.get('/local-confirm-event/:id', isAuth, localConfirmEvent);

module.exports = router;
