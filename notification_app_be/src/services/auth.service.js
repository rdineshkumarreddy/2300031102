const axios = require('axios');
const { Log } = require('../../../logging_middleware');

let cachedToken = null;
let tokenExpiresAt = 0; // Epoch time in ms

async function getAccessToken() {
  const now = Date.now();
  
  if (cachedToken && tokenExpiresAt > now + 30000) {
    return cachedToken;
  }

  const authUrl = process.env.AUTH_API_URL || 'http://4.224.186.213/evaluation-service/auth';
  const payload = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  };

  Log('backend', 'info', 'auth', `Requesting fresh access token from: ${authUrl}`);

  try {
    const response = await axios.post(authUrl, payload, { timeout: 3000 });
    const { access_token, expires_in } = response.data;

    if (!access_token) {
      throw new Error('No access_token returned from Auth API');
    }

    cachedToken = access_token;
    tokenExpiresAt = expires_in ? expires_in * 1000 : now + 3600000;

    Log('backend', 'info', 'auth', 'Successfully obtained and cached fresh access token.');
    return cachedToken;
  } catch (error) {
    Log('backend', 'error', 'auth', `Auth token request failed: ${error.message}.`);
    return null;
  }
}

module.exports = {
  getAccessToken
};
