const axios = require('axios');
const logger = require('../utils/logger');

// Fallback Mock Depots data
const MOCK_DEPOTS = [
  { "DepotID": "DEP-001", "MechanicHours": 8 },
  { "DepotID": "DEP-002", "MechanicHours": 12 },
  { "DepotID": "DEP-003", "MechanicHours": 5 },
  { "DepotID": "DEP-004", "MechanicHours": 20 }
];

async function getDepots() {
  const url = process.env.DEPOTS_API_URL || 'http://20.244.56.144/evaluation-service/depots';
  const timeout = parseInt(process.env.API_TIMEOUT || '5000', 10);
  
  logger.info(`Fetching depots from API: ${url}`);
  
  try {
    const response = await axios.get(url, { 
      timeout,
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN || ''}`
      }
    });
    logger.info(`Successfully fetched depots from API.`);
    return response.data;
  } catch (error) {
    logger.warn(`Failed to fetch depots from API (${error.message}). Falling back to mock depots data.`);
    return MOCK_DEPOTS;
  }
}

module.exports = { getDepots, MOCK_DEPOTS };
