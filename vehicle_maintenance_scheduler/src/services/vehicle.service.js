const axios = require('axios');
const logger = require('../utils/logger');
const authService = require('./auth.service');

const MOCK_TASKS = [
  { "TaskID": "TASK-01", "Duration": 2, "Impact": 10 },
  { "TaskID": "TASK-02", "Duration": 4, "Impact": 30 },
  { "TaskID": "TASK-03", "Duration": 3, "Impact": 15 },
  { "TaskID": "TASK-04", "Duration": 5, "Impact": 40 },
  { "TaskID": "TASK-05", "Duration": 1, "Impact": 5 },
  { "TaskID": "TASK-06", "Duration": 7, "Impact": 50 }
];

async function getTasks() {
  const url = process.env.VEHICLES_API_URL || 'http://4.224.186.213/evaluation-service/vehicles';
  const timeout = parseInt(process.env.API_TIMEOUT || '5000', 10);

  logger.info(`Fetching tasks from API: ${url}`);

  try {
    const token = await authService.getAccessToken();
    const response = await axios.get(url, {
      timeout,
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    logger.info(`Successfully fetched tasks from API.`);
    return response.data;
  } catch (error) {
    logger.warn(`Failed to fetch tasks from API (${error.message}). Falling back to mock tasks data.`);
    return MOCK_TASKS;
  }
}

module.exports = { getTasks, MOCK_TASKS };
