const express = require('express');
const schedulerController = require('../controllers/scheduler.controller');
const { validateScheduleRequest } = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/schedule', schedulerController.getSchedule);
router.post('/schedule', validateScheduleRequest, schedulerController.postSchedule);

module.exports = router;
