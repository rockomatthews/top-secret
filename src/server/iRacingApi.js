/* eslint-disable no-undef */
import axios from 'axios';

let authCookie = null;

const login = async () => {
  try {
    const response = await axios.post('https://members-ng.iracing.com/auth', {
      email: process.env.IRACING_USERNAME,
      password: process.env.IRACING_PASSWORD
    });
    authCookie = response.headers['set-cookie'][0];
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};


const verifyAuth = async () => {
  if (!authCookie) {
    throw new Error('Not authenticated');
  }
  try {
    await axios.get('https://members-ng.iracing.com/data/member/get', {
      headers: { Cookie: authCookie }
    });
    return true;
  } catch (error) {
    console.error('Auth verification failed:', error);
    throw error;
  }
};

const getOfficialRaces = async (page, pageSize) => {
  if (!authCookie) {
    throw new Error('Not authenticated');
  }
  try {
    const response = await axios.get('https://members-ng.iracing.com/data/season/race_guide', {
      headers: { Cookie: authCookie },
      params: { page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch official races:', error);
    throw error;
  }
};

export { login, verifyAuth, getOfficialRaces };