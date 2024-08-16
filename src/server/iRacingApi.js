import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { IRACING_USERNAME, IRACING_PASSWORD } = process.env;

let authCookie = null;

const login = async () => {
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
  cookie = await verifyAuth(cookie);
  try {
    const response = await axios.get('https://members-ng.iracing.com/data/season/race_guide', {
      headers: { Cookie: cookie },
      params: { page, pageSize }
    });
    return { races: response.data, cookie };
  } catch (error) {
    console.error('Failed to fetch official races:', error.message);
    throw new Error('Failed to fetch official races from iRacing API');
  }
};

export { login, verifyAuth, getOfficialRaces };