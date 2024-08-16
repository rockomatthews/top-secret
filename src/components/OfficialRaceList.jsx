import React, { useState, useEffect } from 'react'; // eslint-disable-line no-unused-vars
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  CircularProgress, 
  Box,
  Button
} from '@mui/material';
import axios from 'axios';

const OfficialRaceList = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://top-secret-78e9.onrender.com/api/official-races');
      setRaces(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching races:', error);
      if (error.response && error.response.status === 401) {
        setError('Authentication failed. Please try again later.');
      } else {
        setError('Failed to fetch races. Please try again later.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  const handleRetry = () => {
    fetchRaces();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h6" component="h2" color="error" gutterBottom>
          Error
        </Typography>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" color="primary" onClick={handleRetry} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Official Races
      </Typography>
      {races.length === 0 ? (
        <Typography>No official races available at the moment.</Typography>
      ) : (
        <List>
          {races.map((race, index) => (
            <ListItem key={index} divider>
              <ListItemText 
                primary={race.series_name} 
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Track: {race.track_name}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2">
                      Start Time: {new Date(race.start_time).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      <Button variant="contained" color="primary" onClick={handleRetry} sx={{ mt: 2 }}>
        Refresh Races
      </Button>
    </Box>
  );
};

export default OfficialRaceList;