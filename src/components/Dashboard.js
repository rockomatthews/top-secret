import React from 'react'; // eslint-disable-line no-unused-vars
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import OfficialRaceList from './OfficialRaceList';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SpeedTrapBets
          </Typography>
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 4, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: theme.palette.primary.main
          }}
        >
          Dashboard
        </Typography>
        <Typography 
          variant="body1" 
          gutterBottom
          sx={{
            mb: 3,
            fontSize: isMobile ? '1rem' : '1.1rem'
          }}
        >
          Welcome to your iRacing betting dashboard!
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <OfficialRaceList />
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;