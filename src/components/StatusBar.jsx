import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import GitIcon from '@mui/icons-material/CallSplit';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import WarningIcon from '@mui/icons-material/Warning';
import { useTheme } from '@mui/material/styles';

// VS Code style status bar component
const StatusBar = ({ currentFile, language }) => {
  const theme = useTheme();

  // Get filename from path
  const getFilename = (path) => {
    if (!path) return '';
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  // Get language display name
  const getLanguageDisplayName = (lang) => {
    const displayNames = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'java': 'Java',
      'c': 'C',
      'cpp': 'C++',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'markdown': 'Markdown'
    };
    return displayNames[lang] || lang;
  };

  // Left status items
  const leftStatusItems = [
    {
      id: 'git',
      component: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <GitIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>main</Typography>
        </Box>
      )
    }
  ];

  // Right status items
  const rightStatusItems = [
    {
      id: 'language',
      component: (
        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
          {getLanguageDisplayName(language)}
        </Typography>
      )
    },
    {
      id: 'notifications',
      component: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsNoneIcon sx={{ fontSize: 16 }} />
        </Box>
      )
    },
    {
      id: 'encoding',
      component: (
        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>UTF-8</Typography>
      )
    },
    {
      id: 'lineEnding',
      component: (
        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>LF</Typography>
      )
    },
    {
      id: 'device',
      component: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SmartphoneIcon sx={{ fontSize: 16 }} />
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ 
      display: 'flex',
      height: 22,
      borderTop: '1px solid',
      borderColor: 'rgba(51, 51, 51, 1)',
      bgcolor: '#080E12',
      color: '#FFFFFF',
      fontSize: '12px',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Left status items */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        flexGrow: 1,
        overflow: 'hidden',
        '& > *': {
          height: '100%',
          px: 1,
          display: 'flex',
          alignItems: 'center',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.12)'
          }
        }
      }}>
        {leftStatusItems.map(item => (
          <Tooltip key={item.id} title={item.id.charAt(0).toUpperCase() + item.id.slice(1)}>
            <Box>{item.component}</Box>
          </Tooltip>
        ))}
        
        {currentFile && (
          <Tooltip title={currentFile}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography 
                variant="caption" 
                noWrap 
                sx={{ 
                  maxWidth: 200,
                  display: 'inline-block',
                  fontSize: '0.75rem'
                }}
              >
                {getFilename(currentFile)}
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Right status items */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        '& > *': {
          px: 1,
          borderLeft: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.12)'
          }
        }
      }}>
        {rightStatusItems.map(item => (
          <Tooltip key={item.id} title={item.id.charAt(0).toUpperCase() + item.id.slice(1)}>
            <Box>{item.component}</Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default StatusBar;
