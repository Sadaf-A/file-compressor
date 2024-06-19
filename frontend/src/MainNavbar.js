import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import Logo from './public/logo.png';

const MainNavbar = () => {
  return (
    <AppBar position="static" style={{ backgroundColor: '#212121' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="Logo" style={{ height: 50, marginRight: 10 }} />
          <Typography variant="h6" component="div">
            File Compressor
          </Typography>
        </div>
        <div>
          <Button
            color="inherit"
            component={NavLink}
            to="/"
            sx={{
              width: '120px',
              mr: 1,
              '&:hover': {
                backgroundColor: '#424242',
              },
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={NavLink}
            to="/login"
            sx={{
              width: '120px',
              mr: 1,
              '&:hover': {
                backgroundColor: '#424242',
              },
            }}
          >
            Login
          </Button>
          <Button
            color="inherit"
            component={NavLink}
            to="/register"
            sx={{
              width: '120px',
              '&:hover': {
                backgroundColor: '#424242',
              },
            }}
          >
            Register
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default MainNavbar;
