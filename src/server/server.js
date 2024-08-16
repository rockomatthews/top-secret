import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { login, getOfficialRaces, verifyAuth } from './iRacingApi.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Authentication middleware
const checkAuth = async (req, res, next) => {
  try {
    await verifyAuth();
    next();
  } catch (authError) {
    console.error('Authentication failed:', authError);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Initial login attempt
login().then(() => {
  console.log('Initial login successful');
}).catch((error) => {
  console.error('Initial login failed:', error);
});

// Re-authenticate every 20 minutes
setInterval(() => {
  login().then(() => {
    console.log('Re-authentication successful');
  }).catch((error) => {
    console.error('Re-authentication failed:', error);
  });
}, 20 * 60 * 1000); // 20 minutes in milliseconds

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    await login(username, password);
    res.status(200).json({ message: 'Login successful' });
  } catch (loginError) {
    console.error('Login error:', loginError);
    res.status(401).json({ error: 'Login failed' });
  }
});

app.get('/api/official-races', checkAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const races = await getOfficialRaces(page, pageSize);
    res.status(200).json(races);
  } catch (racesError) {
    console.error('Fetch races error:', racesError);
    res.status(500).json({ error: 'Failed to fetch official races' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
  next(err);
});

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;