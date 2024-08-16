import React, { useState, useEffect, useCallback } from 'react'; // eslint-disable-line no-unused-vars
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
  const [authCookie, setAuthCookie] = useState(localStorage.getItem('authCookie'));

  const fetchRaces = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const currentPage = reset ? 1 : page;
      const response = await axios.get(`${API_URL}/api/official-races`, {
        params: { page: currentPage, pageSize: 10 },
        headers: authCookie ? { Authorization: authCookie } : {}
      });
      
      if (reset) {
        setRaces(response.data.races);
      } else {
        setRaces(prevRaces => [...prevRaces, ...response.data.races]);
      }
      
      if (response.data.cookie) {
        setAuthCookie(response.data.cookie);
        localStorage.setItem('authCookie', response.data.cookie);
      }
      
      setPage(currentPage + 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching races:', error);
      if (error.response && error.response.status === 401) {
        setError('Authentication failed. Please try logging in again.');
        localStorage.removeItem('authCookie');
        setAuthCookie(null);
      } else {
        setError('Failed to fetch races. Please try again later.');
      }
      setLoading(false);
    }
  }, [authCookie, page]);

  useEffect(() => {
    if (authCookie) {
      fetchRaces(true);
    }
  }, [authCookie, fetchRaces]);

  // Function to handle loading more races
  const handleLoadMore = () => {
    fetchRaces();
  };

  // Function to handle refreshing the race list
  const handleRefresh = () => {
    setPage(1);
    fetchRaces(true);
  };

  // Function to handle user login
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/login`);
      if (response.data.cookie) {
        setAuthCookie(response.data.cookie);
        localStorage.setItem('authCookie', response.data.cookie);
        fetchRaces(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  // Render login button if not authenticated
  if (!authCookie) {
    return (
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          Login Required
        </Typography>
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
      </Box>
    );
  }

  // Render loading spinner while fetching data
  if (loading && races.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Render error message if an error occurred
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

  // Render the list of races
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