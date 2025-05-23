import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TerminalIcon from '@mui/icons-material/Terminal';

function Header() {
  return (
    <AppBar 
      position="static" 
      sx={{
        '& .MuiToolbar-root': {
          backgroundColor: 'var(--bg-header)',
          color: 'var(--text-header)',
          borderBottom: '1px solid var(--border-main)',
          minHeight: '48px !important'
        }
      }}
      elevation={0}
    >
      <Toolbar variant="dense" sx={{ px: 2, justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TerminalIcon sx={{ 
            fontSize: 20,
            color: 'var(--button-primary-bg)'
          }} />
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 500,
              fontSize: '14px',
              letterSpacing: '-0.1px',
              color: 'var(--text-header)'
            }}
          >
            Web Terminal
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
