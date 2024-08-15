import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // You can customize this
    },
    secondary: {
      main: '#dc004e', // You can customize this
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        #root {
          height: 100%;
          width: 100%;
        }
      `,
    },
  },
});

export default theme;