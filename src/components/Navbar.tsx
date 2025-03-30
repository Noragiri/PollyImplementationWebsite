import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  username?: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout, username }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Polly Implementation
        </Typography>
        {isAuthenticated && (
          <Box display="flex" alignItems="center">
            <Typography variant="body1" style={{ marginRight: '1rem' }}>
              {username || 'User'}
            </Typography>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;