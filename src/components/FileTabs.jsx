import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

function FileTabs({ openFiles, currentFile, onSelectFile, onCloseFile }) {
  const handleTabChange = (event, newValue) => {
    onSelectFile(newValue);
  };

  const getTabLabel = (filePath) => {
    return filePath.split('/').pop();
  };

  return (
    <Box 
      sx={{
        backgroundColor: 'var(--bg-tab)',
        borderBottom: '1px solid var(--border-main)',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        '& .MuiTabs-root': {
          minHeight: '40px',
          backgroundColor: 'var(--bg-tab)'
        },
        '& .MuiTab-root': {
          minHeight: '40px',
          padding: '0 16px',
          color: 'var(--text-secondary)',
          textTransform: 'none',
          fontSize: '13px',
          '&.Mui-selected': {
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-active-tab)'
          }
        }
      }}
    >
      <Tabs 
        value={currentFile} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {openFiles.map((file) => (
          <Tab
            key={file}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{getTabLabel(file)}</span>
                <Box
                  component="span"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(file);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    '&:hover': {
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--action-hover)'
                    }
                  }}
                >
                  <CloseIcon sx={{ fontSize: '16px' }} />
                </Box>
              </Box>
            }
            value={file}
          />
        ))}
      </Tabs>
    </Box>
  );
}

export default FileTabs;