const express = require('express');
const router = express.Router({});
const {
  getCurrentWeekEvents, getEventData, getSelectedVcParts, getVcParts,
} = require('./events');

router.post('/get-week', getCurrentWeekEvents);
router.get('/get-event-data/:id', getEventData);
router.get('/get-selected-vc-parts', getSelectedVcParts);
router.get('/get-vc-parts', getVcParts);

module.exports = router;
