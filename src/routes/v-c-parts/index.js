const express = require('express');
const router = express.Router({});
const {
  getVCParts,
  getSelectedVcParts,
} = require('src/routes/v-c-parts/handlers');
const isAuth = require('src/routes/middlewares/check-authenticated');

router.get('/all', isAuth, getVCParts);
router.get('/selected', getSelectedVcParts);

module.exports = router;
