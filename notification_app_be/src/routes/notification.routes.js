const express = require('express');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

router.get('/top-notifications', notificationController.getTopNotifications);

module.exports = router;
