import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { IRACING_USERNAME, IRACING_PASSWORD } = process.env;

let authCookie = null;
let lastLoginAttempt = 0;
const LOGIN_COOLDOWN = 60000; // 1 minute cooldown between login attempts

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

const verifyAuth = async (cookie) => {
  if (!cookie && !authCookie) {
    console.log('No auth cookie, attempting to login');
    return await login();
  }
  
  const cookieToUse = cookie || authCookie;
  
  try {
    await axios.get('https://members-ng.iracing.com/data/member/get', {
      headers: { Cookie: cookieToUse }
    });
    console.log('Auth verification successful');
    authCookie = cookieToUse;  // Update the stored cookie if verification was successful
    return cookieToUse;
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized, attempting to re-login');
      return await login();
    }
    throw new Error('Failed to verify authentication with iRacing API');
  }
};

const getOfficialRaces = async (page, pageSize, cookie) => {
  const verifiedCookie = await verifyAuth(cookie);
  try {
    const response = await axios.get('https://members-ng.iracing.com/data/season/race_guide', {
      headers: { Cookie: verifiedCookie },
      params: { page, pageSize }
    });
    return { races: response.data, cookie: verifiedCookie };
  } catch (error) {
    console.error('Failed to fetch official races:', error.message);
    throw new Error('Failed to fetch official races from iRacing API');
  }
};

export { login, verifyAuth, getOfficialRaces };