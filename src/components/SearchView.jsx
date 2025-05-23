import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import SearchIcon from '@mui/icons-material/Search';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// File type icon mapper
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
    // Add more as needed
  };
  
  return (
    <InsertDriveFileOutlinedIcon 
      fontSize="small" 
      sx={{ 
        color: iconColors[extension] || '#9E9E9E' 
      }} 
    />
  );
};

const SearchView = ({ files, onFileSelect }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  // Recursive function to search through files
  const searchFiles = (obj, parentPath = '', results = []) => {
    Object.entries(obj).forEach(([name, value]) => {
      const path = `${parentPath}/${name}`.replace(/^\/+/, '/');
      
      if (typeof value === 'string') { // It's a file
        let matches = false;
        if (caseSensitive) {
          matches = name.includes(searchQuery) || value.includes(searchQuery);
        } else {
          matches = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    value.toLowerCase().includes(searchQuery.toLowerCase());
        }
        
        if (matches) {
          // Find the matching text and get surrounding context
          let context = '';
          let contentLower = value.toLowerCase();
          let queryLower = searchQuery.toLowerCase();
          let index = caseSensitive ? value.indexOf(searchQuery) : contentLower.indexOf(queryLower);
          
          if (index !== -1) {
            let start = Math.max(0, index - 30);
            let end = Math.min(value.length, index + searchQuery.length + 30);
            context = (start > 0 ? '...' : '') + 
                     value.substring(start, end) + 
                     (end < value.length ? '...' : '');
          }
          
          results.push({
            path,
            name,
            type: 'file',
            context: context || (value.length > 300 ? value.substring(0, 300) + '...' : value)
          });
        }
      } else if (typeof value === 'object') { // It's a folder
        if ((caseSensitive && name.includes(searchQuery)) || 
            (!caseSensitive && name.toLowerCase().includes(searchQuery.toLowerCase()))) {
          results.push({
            path,
            name,
            type: 'folder'
          });
        }
        // Continue searching recursively
        searchFiles(value, path, results);
      }
    });
    
    return results;
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = searchFiles(files);
    setSearchResults(results);
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: isDark ? '#1E1E1E' : '#F3F3F3',
      borderRight: '1px solid',
      borderColor: isDark ? 'rgba(77, 77, 77, 0.6)' : 'rgba(226, 226, 226, 1)',
    }}>
      {/* Search header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: 1,
        py: 0.5,
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(77, 77, 77, 0.6)' : 'rgba(226, 226, 226, 1)',
      }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: 0.2,
            textTransform: 'uppercase',
            opacity: 0.8,
            pl: 1,
          }}
        >
          Search
        </Typography>
        <Box>
          <IconButton size="small">
            <FindReplaceIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {/* Search input */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: isDark ? 'rgba(77, 77, 77, 0.6)' : 'rgba(226, 226, 226, 1)' }}>
        <TextField 
          fullWidth
          size="small"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ opacity: 0.7 }} /></InputAdornment>
          }}
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              bgcolor: isDark ? alpha('#000000', 0.2) : alpha('#FFFFFF', 0.8),
              border: '1px solid',
              borderColor: isDark ? 'rgba(77, 77, 77, 0.8)' : 'rgba(226, 226, 226, 1)',
              '&:hover': {
                borderColor: isDark ? 'rgba(97, 97, 97, 1)' : 'rgba(206, 206, 206, 1)',
              },
              '&.Mui-focused': {
                borderColor: '#0078D4',
                boxShadow: isDark ? '0 0 0 1px rgba(0, 120, 212, 0.5)' : '0 0 0 1px rgba(0, 120, 212, 0.3)',
              }
            }
          }}
        />
        
        {/* Search options */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <FormControlLabel
            control={<Checkbox size="small" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} />}
            label={<Typography variant="caption">Match Case</Typography>}
            sx={{ mr: 1, '& .MuiTypography-root': { fontSize: '11px' } }}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} />}
            label={<Typography variant="caption">Whole Word</Typography>}
            sx={{ mr: 1, '& .MuiTypography-root': { fontSize: '11px' } }}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={useRegex} onChange={e => setUseRegex(e.target.checked)} />}
            label={<Typography variant="caption">Use Regex</Typography>}
            sx={{ '& .MuiTypography-root': { fontSize: '11px' } }}
          />
        </Box>
        
        <Box sx={{ mt: 1, display: 'flex' }}>
          <Button 
            variant="text" 
            size="small" 
            onClick={handleSearch}
            sx={{ 
              textTransform: 'none', 
              fontSize: '12px', 
              mr: 1,
              color: '#0078D4',
              minWidth: '60px',
              py: 0.5,
              px: 1
            }}
          >
            Search
          </Button>
          <Button 
            variant="text"
            size="small"
            sx={{ 
              textTransform: 'none', 
              fontSize: '12px',
              color: theme.palette.text.secondary,
              minWidth: '60px',
              py: 0.5,
              px: 1
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>
      
      {/* Search results */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        position: 'relative'
      }}>
        {searchResults.length > 0 ? (
          <Box>
            <Box sx={{ 
              px: 1, 
              py: 0.5, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: isDark ? 'rgba(77, 77, 77, 0.6)' : 'rgba(226, 226, 226, 1)',
            }}>
              <Typography variant="caption" sx={{ fontSize: '11px' }}>
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
              </Typography>
              <Chip 
                label={`${searchQuery}`} 
                size="small"
                variant="outlined"
                sx={{ 
                  height: 20, 
                  '& .MuiChip-label': { 
                    px: 1, 
                    fontSize: '10px' 
                  } 
                }}
              />
            </Box>
            
            <List dense disablePadding>
              {searchResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    button 
                    onClick={() => result.type === 'file' && onFileSelect(result.path)}
                    sx={{ 
                      py: 0.5,
                      px: 1,
                      borderLeft: '3px solid',
                      borderColor: 'transparent',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(77, 77, 77, 0.3)' : 'rgba(226, 226, 226, 0.5)',
                        borderColor: '#0078D4',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {result.type === 'file' ? getFileIcon(result.name) : 
                       <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: '#E8AB53' }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" sx={{ 
                            fontSize: '10px', 
                            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                            display: 'block',
                            mb: 0.5
                          }}>
                            {result.path}
                          </Typography>
                          {result.type === 'file' && result.context && (
                            <Typography 
                              component="div" 
                              variant="caption" 
                              sx={{ 
                                fontSize: '11px',
                                fontFamily: "Menlo, Monaco, 'SF Mono', 'Courier New', monospace",
                                whiteSpace: 'pre-wrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                backgroundColor: isDark ? 'rgba(40, 40, 40, 0.5)' : 'rgba(239, 239, 239, 0.5)',
                                p: 0.5,
                                borderRadius: 0.5,
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(77, 77, 77, 0.6)' : 'rgba(226, 226, 226, 1)',
                              }}
                            >
                              {result.context}
                            </Typography>
                          )}
                        </Box>
                      }
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { 
                          fontWeight: 500,
                          fontSize: '12px',
                          lineHeight: 1.5,
                        }
                      }}
                    />
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider component="li" sx={{ 
                    opacity: isDark ? 0.2 : 0.4,
                    ml: 4,
                    mr: 1
                  }} />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ) : (
          searchQuery ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', mt: 2 }}>
              <SearchIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2" sx={{ fontSize: '12px' }}>No results found</Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', mt: 2 }}>
              <SearchIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2" sx={{ fontSize: '12px' }}>Type to search in files</Typography>
              <Typography variant="caption" sx={{ fontSize: '11px', display: 'block', mt: 1, opacity: 0.7 }}>
                Use * to match any character
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

export default SearchView;
