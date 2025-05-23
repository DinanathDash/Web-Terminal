import React from 'react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// File type icons with VS Code colors
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const iconColors = {
    js: '#FFCA28',      // JavaScript - yellow
    jsx: '#61DAFB',     // React - blue
    ts: '#3178C6',      // TypeScript - blue
    tsx: '#61DAFB',     // React TS - blue
    html: '#E34F26',    // HTML - orange
    css: '#1572B6',     // CSS - blue
    json: '#8BC34A',    // JSON - green
    md: '#42A5F5',      // Markdown - blue
    py: '#3776AB',      // Python - blue
    java: '#007396',    // Java - blue
    c: '#A8B9CC',       // C - grey
    cpp: '#00599C',     // C++ - blue
    go: '#00ADD8',      // Go - blue
    rs: '#CE412B',      // Rust - red
    rb: '#CC342D',      // Ruby - red
    php: '#777BB4',     // PHP - purple
    // Add more extensions as needed
  };
  
  return (
    <InsertDriveFileOutlinedIcon 
      fontSize="small" 
      sx={{ 
        mr: 0.5, 
        color: iconColors[extension] || '#9E9E9E' 
      }} 
    />
  );
};

const FileBreadcrumbs = ({ currentFile }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!currentFile) return null;

  // Parse path into segments
  const segments = currentFile.split('/').filter(Boolean);
  const fileName = segments.pop();
  
  return (
    <Box 
      sx={{ 
        py: 0.5, 
        px: 1.5,
        minHeight: 28,
        bgcolor: isDark ? alpha('#1E1E1E', 0.8) : alpha('#F3F3F3', 0.8),
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(77, 77, 77, 0.6)' : 'rgba(226, 226, 226, 1)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Breadcrumbs 
        separator={<ChevronRightIcon sx={{ fontSize: 14 }} />} 
        aria-label="breadcrumb"
        maxItems={4}
        itemsBeforeCollapse={1}
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: 0.2,
            color: theme.palette.text.secondary,
            opacity: 0.7,
          },
          '& .MuiTypography-root': {
            display: 'flex',
            alignItems: 'center',
            fontSize: '11px',
          }
        }}
      >
        {segments.map((segment, index) => (
          <Link
            key={index}
            underline="hover"
            color="inherit"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              fontSize: '11px',
              fontFamily: "Menlo, Monaco, 'SF Mono', 'Courier New', monospace",
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                borderRadius: '3px',
              },
              px: 0.5,
              py: 0.2,
            }}
          >
            <FolderIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7, color: '#E8AB53' }} />
            {segment}
          </Link>
        ))}
        <Typography 
          color="textPrimary" 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            fontSize: '11px',
            fontFamily: "Menlo, Monaco, 'SF Mono', 'Courier New', monospace",
            fontWeight: 500,
          }}
        >
          {getFileIcon(fileName)}
          {fileName}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
};

export default FileBreadcrumbs;
