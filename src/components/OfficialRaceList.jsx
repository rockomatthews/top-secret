import React, { useState, useEffect, useCallback } from 'react';
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

const API_URL = 'https://top-secret-78e9.onrender.com';

const OfficialRaceList = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchRaces = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching races...');
      const currentPage = reset ? 1 : page;
      const response = await axios.get(`${API_URL}/api/official-races`, {
        params: { page: currentPage, pageSize: 10 }
      });
      console.log('Received response:', response.data);
      
      if (reset) {
        setRaces(response.data.races);
      } else {
        setRaces(prevRaces => [...prevRaces, ...response.data.races]);
      }
      
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Error fetching races:', error);
      setError(`Failed to fetch races: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRaces(true);
  }, [fetchRaces]);

  const handleLoadMore = () => {
    fetchRaces();
  };

  const handleRefresh = () => {
    setPage(1);
    fetchRaces(true);
  };

  if (loading && races.length === 0) {
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
        <Button variant="contained" color="primary" onClick={handleRefresh} sx={{ mt: 2 }}>
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
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" color="primary" onClick={handleRefresh}>
          Refresh Races
        </Button>
        {races.length > 0 && (
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleLoadMore} 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Load More'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OfficialRaceList;