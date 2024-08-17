import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { IRACING_USERNAME, IRACING_PASSWORD } = process.env;

let authCookie = null;
let lastAuthCheck = 0;
const AUTH_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes

const login = async () => {
  try {
    console.log('Attempting to log in...');
    const response = await axios.post('https://members-ng.iracing.com/auth', {
      email: IRACING_USERNAME,
      password: IRACING_PASSWORD
    });
    authCookie = response.headers['set-cookie'][0];
    console.log('Login successful, auth cookie set');
    return authCookie;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw new Error('Failed to authenticate with iRacing API');
  }
};

const refreshAuth = async () => {
  try {
    console.log('Refreshing authentication...');
    await axios.get('https://members-ng.iracing.com/data/member/get', {
      headers: { Cookie: authCookie }
    });
    console.log('Authentication refreshed successfully');
    lastAuthCheck = Date.now();
  } catch (error) {
    console.error('Auth refresh failed:', error.message);
    authCookie = null; // Clear the cookie if refresh fails
    throw new Error('Failed to refresh authentication');
  }
};

const ensureAuth = async () => {
  if (!authCookie) {
    return await login();
  }
  
  const now = Date.now();
  if (now - lastAuthCheck > AUTH_CHECK_INTERVAL) {
    await refreshAuth();
  }
  
  return authCookie;
};

const getOfficialRaces = async (page, pageSize) => {
  await ensureAuth();
  try {
    const response = await axios.get('https://members-ng.iracing.com/data/season/race_guide', {
      headers: { Cookie: authCookie },
      params: { page, pageSize }
    });
    return { races: response.data };
  } catch (error) {
    console.error('Failed to fetch official races:', error.message);
    throw new Error('Failed to fetch official races from iRacing API');
  }
};

export { login, ensureAuth, getOfficialRaces };