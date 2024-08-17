import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { getOfficialRaces } from './iRacingApi.js';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// Check for Supabase environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
  process.exit(1);
}

// Supabase client initialization
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/api/official-races', async (req, res) => {
  console.log('Fetching official races...');
  try {
    const { page = 1, pageSize = 10 } = req.query;
    console.log(`Fetching races for page ${page} with pageSize ${pageSize}`);
    const { races, totalCount } = await getOfficialRaces(Number(page), Number(pageSize));
    console.log(`Fetched ${races.length} races`);
    
    // Process and store races in Supabase
    console.log('Storing races in Supabase...');
    const { data, error } = await supabase
      .from('official_races')
      .upsert(races.map(race => ({
        series_id: race.series_id,
        series_name: race.series_name,
        season_id: race.season_id,
        // Add other relevant fields
      })), { onConflict: 'series_id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      throw error;
    }

    // Fetch processed races from Supabase
    console.log('Fetching processed races from Supabase...');
    const { data: processedRaces, error: fetchError } = await supabase
      .from('official_races')
      .select('*')
      .order('series_name', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      throw fetchError;
    }

    console.log(`Sending ${processedRaces.length} processed races to client`);
    res.status(200).json({ races: processedRaces, totalCount });
  } catch (racesError) {
    console.error('Fetch races error:', racesError.message);
    res.status(500).json({ error: 'Failed to fetch official races' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
  next(err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;