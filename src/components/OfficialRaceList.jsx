import React, { useState, useEffect } from 'react'; // eslint-disable-line no-unused-vars
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  CircularProgress, 
  Box 
} from '@mui/material';
import axios from 'axios';

const OfficialRaceList = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await axios.get('https://top-secret-78e9.onrender.com/api/official-races');
        setRaces(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching races:', error);
        setError('Failed to fetch races. Please try again later.');
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

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
    </Box>
  );
};

export default OfficialRaceList;