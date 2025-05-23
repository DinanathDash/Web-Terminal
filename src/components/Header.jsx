import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useTheme } from '@mui/material/styles';

function Header({ onMobileExplorerToggle }) {
  const theme = useTheme();
  
  return (
    <AppBar 
      position="static" 
      sx={{
        borderRadius: 0,
        border: 'none',
        '& .MuiToolbar-root': {
          backgroundColor: 'var(--bg-header)',
          color: 'var(--text-header)',
          borderBottom: '1px solid var(--border-main)',
          minHeight: { xs: '40px !important', sm: '48px !important' },
          borderRadius: 0
        }
      }}
      elevation={0}
    >
      <Toolbar variant="dense" sx={{ 
        px: { xs: 1, sm: 2 }, 
        justifyContent: 'space-between', 
        gap: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={onMobileExplorerToggle}
            size="small"
            sx={{ 
              display: { sm: 'none' },
              color: 'var(--text-header)',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)' 
              }
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <TerminalIcon sx={{ 
            fontSize: { xs: 18, sm: 20 },
            color: 'var(--button-primary-bg)'
          }} />
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 500,
              fontSize: { xs: '13px', sm: '14px' },
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
