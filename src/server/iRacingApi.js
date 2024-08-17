import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const { IRACING_USERNAME, IRACING_PASSWORD } = process.env;

let authCookie = null;

const login = async () => {
  try {
    console.log('Attempting to log in...');
    const email = IRACING_USERNAME.toLowerCase();
    const password = IRACING_PASSWORD;
    const hashPassword = crypto.createHash('sha256')
      .update(password + email)
      .digest('base64');

    const response = await axios.post('https://members-ng.iracing.com/auth', {
      email: IRACING_USERNAME,
      password: hashPassword
    }, {
      maxRedirects: 0,
      validateStatus: status => status >= 200 && status < 303
    });
    
    authCookie = response.headers['set-cookie'][0];
    console.log('Login successful, auth cookie set');
    return authCookie;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw new Error('Failed to authenticate with iRacing API');
  }
};

const getOfficialRaces = async (page = 1, pageSize = 10) => {
  if (!authCookie) {
    await login();
  }
  
  try {
    console.log('Fetching series seasons...');
    const response = await axios.get('https://members-ng.iracing.com/data/series/seasons', {
      headers: { Cookie: authCookie },
      params: { include_series: true }
    });
    
    console.log('Response received:', response.status);
    
    if (response.data && response.data.link) {
      console.log('Fetching data from link:', response.data.link);
      const dataResponse = await axios.get(response.data.link);
      console.log('Data response received:', dataResponse.status);

      const allSeries = dataResponse.data.series || [];
      const officialSeries = allSeries.filter(series => series.official);
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedSeries = officialSeries.slice(start, end);
      
      console.log(`Returning ${paginatedSeries.length} races out of ${officialSeries.length} total`);
      return { races: paginatedSeries, totalCount: officialSeries.length };
    } else {
      console.error('Unexpected response format:', response.data);
      throw new Error('Unexpected response format from iRacing API');
    }
  } catch (error) {
    console.error('Failed to fetch official races:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to fetch official races from iRacing API');
  }
};

export { login, getOfficialRaces };