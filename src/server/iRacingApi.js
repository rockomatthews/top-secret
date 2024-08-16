import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { IRACING_USERNAME, IRACING_PASSWORD } = process.env;

let authCookie = null;
let lastLoginAttempt = 0;
const LOGIN_COOLDOWN = 60000; // 1 minute cooldown between login attempts

// Cache setup
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

const login = async () => {
  const now = Date.now();
  if (now - lastLoginAttempt < LOGIN_COOLDOWN) {
    console.log('Login attempt too soon, waiting...');
    await new Promise(resolve => setTimeout(resolve, LOGIN_COOLDOWN - (now - lastLoginAttempt)));
  }
  
  lastLoginAttempt = Date.now();
  try {
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

const verifyAuth = async (cookie = authCookie) => {
  if (!cookie) {
    console.log('No auth cookie, attempting to login');
    cookie = await login();
  }
  try {
    await axios.get('https://members-ng.iracing.com/data/member/get', {
      headers: { Cookie: cookie }
    });
    console.log('Auth verification successful');
    return cookie;
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized, attempting to re-login');
      cookie = await login();
      return verifyAuth(cookie);
    }
    throw new Error('Failed to verify authentication with iRacing API');
  }
};

const getOfficialRaces = async (page, pageSize, cookie) => {
  const cacheKey = `races_${page}_${pageSize}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('Returning cached race data');
    return { races: cachedData.races, cookie };
  }

  cookie = await verifyAuth(cookie);
  try {
    const response = await axios.get('https://members-ng.iracing.com/data/season/race_guide', {
      headers: { Cookie: cookie },
      params: { page, pageSize }
    });
    const races = response.data;
    
    // Update cache
    cache.set(cacheKey, { races, timestamp: Date.now() });
    console.log('Fetched fresh race data and updated cache');
    
    return { races, cookie };
  } catch (error) {
    console.error('Failed to fetch official races:', error.message);
    throw new Error('Failed to fetch official races from iRacing API');
  }
};

// Function to clear expired cache entries
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
};

// Run cache cleanup every 10 minutes
setInterval(clearExpiredCache, 10 * 60 * 1000);

export { login, verifyAuth, getOfficialRaces };