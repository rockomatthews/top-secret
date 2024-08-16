import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { login, getOfficialRaces, verifyAuth } from './iRacingApi.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Authentication middleware
const checkAuth = async (req, res, next) => {
  try {
    const cookie = req.headers.authorization;
    const validCookie = await verifyAuth(cookie);
    req.authCookie = validCookie;
    next();
  } catch (authError) {
    console.error('Authentication failed:', authError.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Initial login attempt
login().then(() => {
  console.log('Initial login successful');
}).catch((error) => {
  console.error('Initial login failed:', error.message);
});

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.post('/api/login', async (req, res) => {
  try {
    const cookie = await login();
    res.status(200).json({ message: 'Login successful', cookie });
  } catch (loginError) {
    console.error('Login error:', loginError.message);
    res.status(401).json({ error: 'Login failed' });
  }
});

app.get('/api/official-races', checkAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const { races, cookie } = await getOfficialRaces(page, pageSize, req.authCookie);
    res.status(200).json({ races, cookie });
  } catch (racesError) {
    console.error('Fetch races error:', racesError.message);
    res.status(500).json({ error: 'Failed to fetch official races' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
  next(err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;