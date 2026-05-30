const axios = require('axios');
const logger = require('../utils/logger');
const authService = require('./auth.service');

// Fallback Mock Depots data
const MOCK_DEPOTS = [
  { "DepotID": "DEP-001", "MechanicHours": 8 },
  { "DepotID": "DEP-002", "MechanicHours": 12 },
  { "DepotID": "DEP-003", "MechanicHours": 5 },
  { "DepotID": "DEP-004", "MechanicHours": 20 }
];

async function getDepots() {
  const url = process.env.DEPOTS_API_URL || 'http://4.224.186.213/evaluation-service/depots';
  const timeout = parseInt(process.env.API_TIMEOUT || '5000', 10);
  
  logger.info(`Fetching depots from API: ${url}`);
  
  try {
    const token = await authService.getAccessToken();
    const response = await axios.get(url, { 
      timeout,
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    const data = response.data;
    const depotsArray = Array.isArray(data) ? data : (data && Array.isArray(data.depots) ? data.depots : null);
    if (!depotsArray) {
      throw new Error('API response does not contain a valid depots array');
    }
    
    logger.info(`Successfully fetched depots from API.`);
    return depotsArray;
  } catch (error) {
    logger.warn(`Failed to fetch depots from API (${error.message}). Falling back to mock depots data.`);
    return MOCK_DEPOTS;
  }
}

module.exports = { getDepots, MOCK_DEPOTS };
