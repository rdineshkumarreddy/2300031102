const axios = require('axios');
const { logger } = require('../../../logging_middleware');

const MOCK_NOTIFICATIONS = {
  "notifications": [
    {
      "ID": "n1",
      "Type": "Result",
      "Message": "Mathematics Midterm Results published",
      "Timestamp": "2026-04-22 17:51:30"
    },
    {
      "ID": "n2",
      "Type": "Placement",
      "Message": "Amazon recruitment drive registration opens today",
      "Timestamp": "2026-04-23 10:00:00"
    },
    {
      "ID": "n3",
      "Type": "Event",
      "Message": "Annual sports meet registration extended",
      "Timestamp": "2026-04-21 09:00:00"
    },
    {
      "ID": "n4",
      "Type": "Placement",
      "Message": "Google interview scheduling announcement",
      "Timestamp": "2026-04-23 15:30:00"
    },
    {
      "ID": "n5",
      "Type": "Result",
      "Message": "DBMS Lab exam scores released",
      "Timestamp": "2026-04-22 12:00:00"
    },
    {
      "ID": "n6",
      "Type": "Event",
      "Message": "Workshop on Cloud Computing by Azure experts",
      "Timestamp": "2026-04-24 14:00:00"
    },
    {
      "ID": "n7",
      "Type": "Placement",
      "Message": "Infosys onboarding updates for 2026 batch",
      "Timestamp": "2026-04-20 18:20:00"
    },
    {
      "ID": "n8",
      "Type": "Result",
      "Message": "Compiler Design final grades declared",
      "Timestamp": "2026-04-24 09:15:00"
    },
    {
      "ID": "n9",
      "Type": "Event",
      "Message": "Hackathon registration closes tonight",
      "Timestamp": "2026-04-25 11:00:00"
    },
    {
      "ID": "n10",
      "Type": "Placement",
      "Message": "Microsoft PPT presentation guidelines document",
      "Timestamp": "2026-04-25 13:45:00"
    },
    {
      "ID": "n11",
      "Type": "Result",
      "Message": "Operating Systems re-evaluations results",
      "Timestamp": "2026-04-25 08:30:00"
    },
    {
      "ID": "n12",
      "Type": "Event",
      "Message": "College cultural fest 'VIBE 2026' schedule",
      "Timestamp": "2026-04-19 10:00:00"
    }
  ]
};

async function getRawNotifications() {
  const url = process.env.NOTIFICATIONS_API_URL || 'http://4.224.186.213/evaluation-service/notifications';
  const timeout = parseInt(process.env.API_TIMEOUT || '3000', 10);

  logger.info(`Fetching notifications from API: ${url}`);

  try {
    const response = await axios.get(url, {
      timeout,
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN || ''}`
      }
    });
    logger.info(`Successfully fetched notifications from external API.`);
    return response.data;
  } catch (error) {
    logger.warn(`Failed to fetch notifications from API (${error.message}). Falling back to mock notifications.`);
    return MOCK_NOTIFICATIONS;
  }
}

module.exports = {
  getRawNotifications,
  MOCK_NOTIFICATIONS
};
