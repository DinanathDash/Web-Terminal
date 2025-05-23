import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import {
  DiJavascript1, DiPython, DiHtml5, DiCss3,
  DiReact, DiMarkdown, DiCode, DiJava
} from 'react-icons/di';
import {
  SiTypescript, SiJson, SiYaml, SiGit
} from 'react-icons/si';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useTheme } from '@mui/material/styles';
import io from 'socket.io-client';

// Backend URL
// Use environment variable or fallback to local server during development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

function FileExplorer({ files, onFileOpen, setFiles }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // State for expanded folders
  const [expanded, setExpanded] = useState({});

  // State for context menu
  const [contextMenu, setContextMenu] = useState(null);

  // State for new file/folder dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('file'); // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState('');
  const [currentPath, setCurrentPath] = useState('');

  // State for add file/folder menu
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);

  // File extensions to icon mappings with more VS Code-like styling
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    let iconSize = '1.25rem';

    // Map file extensions to appropriate icons and colors
    switch (extension) {
      // JavaScript family
      case 'js':
        return <DiJavascript1 size={iconSize} color="#FFD700" />;
      case 'jsx':
        return <DiReact size={iconSize} color="#00D8FF" />;
      case 'ts':
        return <SiTypescript size={iconSize} color="#007ACC" />;
      case 'tsx':
        return (
          <Box sx={{ position: 'relative' }}>
            <SiTypescript size={iconSize} color="#007ACC" />
            <Box sx={{ position: 'absolute', right: -4, bottom: -4, fontSize: '0.5rem' }}>
              <DiReact size="0.7rem" color="#00D8FF" />
            </Box>
          </Box>
        );

      // Web files
      case 'html':
        return <DiHtml5 size={iconSize} color="#FF5722" />;
      case 'css':
        return <DiCss3 size={iconSize} color="#1976D2" />;

      // Config files
      case 'json':
        return <SiJson size={iconSize} color="#FF9800" />;
      case 'yml':
      case 'yaml':
        return <SiYaml size={iconSize} color="#FDD835" />;

      // Python and Java
      case 'py':
        return <DiPython size={iconSize} color="#4CAF50" />;
      case 'java':
        return <DiJava size={iconSize} color="#F44336" />;
      case 'c':
        return <DiCode size={iconSize} color="#2196F3" />;
      case 'cpp':
        return <DiCode size={iconSize} color="#00BCD4" />;
      // Document files
      case 'md':
        return <DiMarkdown size={iconSize} color="#2196F3" />;

      // Config and System files
      case 'gitignore':
        return <SiGit size={iconSize} color="#F05033" />;

      // Default file icons by category
      default:
        // Text files
        if (['txt', 'log', 'env', 'ini', 'conf'].includes(extension)) {
          return <DescriptionIcon sx={{ fontSize: iconSize, color: '#FF6B35' }} />;
        }
        // Image files 
        else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'].includes(extension)) {
          return <InsertDriveFileIcon sx={{ fontSize: iconSize, color: '#FF1744' }} />;
        }
        // Code files that don't have specific icons
        else if (['jsx', 'tsx', 'mjs', 'cjs'].includes(extension)) {
          return <DiCode size={iconSize} color="#00E676" />;
        }
        // Any other file
        else {
          return <DiCode size={iconSize} color="#9C27B0" />;
        }
    }
  };

  // Toggle folder expanded state
  const handleToggleFolder = (path) => {
    setExpanded({
      ...expanded,
      [path]: !expanded[path]
    });
  };

  // Handle opening add menu
  const handleAddMenuOpen = (event) => {
    setAddMenuAnchor(event.currentTarget);
  };

  // Handle closing add menu
  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  // Open dialog for new file or folder
  const handleNewItem = (type, path = '') => {
    setDialogType(type);
    setNewItemName('');
    setCurrentPath(path);
    setDialogOpen(true);
    handleAddMenuClose();
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Helper function to get the default content for a file based on extension
  const getDefaultContent = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();

    if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'rb', 'go', 'rs'].includes(extension)) {
      return new Promise((resolve) => {
        console.log(`FileExplorer connecting to: ${BACKEND_URL}`);
        const socket = io(BACKEND_URL, {
          path: '/socket.io',
          reconnectionDelayMax: 10000,
          reconnection: true,
          reconnectionAttempts: 3,
          transports: ['polling', 'websocket'],
          upgrade: true,
          rememberUpgrade: true,
          timeout: 10000,
          forceNew: true,
          withCredentials: true
        });

        // Setup all event listeners before emitting
        socket.on('connect', () => {
          socket.emit('get-template', extension);
        });

        socket.on('template', (template) => {
          socket.disconnect();
          resolve(template || getBasicTemplate(extension));
        });

        socket.on('connect_error', () => {
          console.warn('Failed to connect to server for template');
          socket.disconnect();
          resolve(getBasicTemplate(extension));
        });

        // Fallback after timeout
        const timeoutId = setTimeout(() => {
          socket.disconnect();
          resolve(getBasicTemplate(extension));
        }, 3000);

        // Clean up timeout if we get a response
        socket.on('template', () => clearTimeout(timeoutId));
      });
    }

    return Promise.resolve(getBasicTemplate(filename));
  };

  // Basic fallback templates
  const getBasicTemplate = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
      case 'js':
      case 'jsx':
        return '// JavaScript\nconsole.log("Hello from Web Terminal!");\n';
      case 'ts':
      case 'tsx':
        return '// TypeScript\nconst greeting: string = "Hello from Web Terminal!";\nconsole.log(greeting);\n';
      case 'py':
        return '# Python\n\nprint("Hello from Web Terminal!")\n\n# Define a function\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\n# Call the function\nprint(greet("Python"))\n';
      case 'html':
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Web Terminal</title>\n</head>\n<body>\n  <h1>Hello from Web Terminal!</h1>\n</body>\n</html>\n';
      case 'css':
        return '/* CSS */\nbody {\n  font-family: system-ui, -apple-system, sans-serif;\n  line-height: 1.5;\n  margin: 0;\n  padding: 20px;\n}\n';
      case 'json':
        return '{\n  "greeting": "Hello from Web Terminal!"\n}\n';
      case 'md':
        return '# Hello from Web Terminal\n\nThis is a markdown document.\n';
      default:
        return '';
    }
  };

  // Ensure new files and folders are created with proper structure
  const createSafeItem = async (itemName, itemType) => {
    if (itemType === 'folder') {
      return {
        type: 'folder',
        children: {} // Initialize with empty children object
      };
    } else {
      // For files, get content with templates
      const content = await getDefaultContent(itemName);

      return {
        type: 'file',
        content: content || '' // Ensure we have content even if template fails
      };
    }
  };

  // Handle file/folder creation
  const handleCreateItem = async () => {
    if (!newItemName) return;

    const newItem = await createSafeItem(newItemName, dialogType);
    const path = currentPath ? `${currentPath}/${newItemName}` : newItemName;

    // Create a deep copy of the files structure
    const updatedFiles = JSON.parse(JSON.stringify(files));
    let current = updatedFiles;

    if (currentPath) {
      const parts = currentPath.split('/').filter(Boolean);
      for (const part of parts) {
        if (!current[part]) {
          current[part] = { type: 'folder', children: {} };
        }
        if (!current[part].children) {
          current[part].children = {};
        }
        current = current[part].children;
      }
    }

    current[newItemName] = newItem;
    setFiles(updatedFiles);

    // Clear dialog
    setNewItemName('');
    setDialogOpen(false);

    // Open the file if it's a file
    if (dialogType === 'file') {
      onFileOpen(path);
    }
  };

  // Render the file tree recursively with modern VS Code-like styling
  const renderTree = (filesObj, path = '') => {
    return Object.entries(filesObj).map(([key, value]) => {
      const currentPath = path ? `${path}/${key}` : `/${key}`;
      const isExpanded = expanded[currentPath] || false;
      const indentationLevel = path.split('/').filter(Boolean).length;

      if (value.type === 'folder') {
        return (
          <React.Fragment key={currentPath}>
            <ListItemButton
              onClick={() => handleToggleFolder(currentPath)}
              disableRipple
              sx={{
                pl: indentationLevel * 1.5 + 0.5,
                py: 0.25,
                minHeight: 24,
                borderRadius: 0,
                position: 'relative',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                },
                '&:hover .add-button': {
                  opacity: 1,
                },
                // VS Code-style selection
                '&:focus': {
                  backgroundColor: isDarkMode ? 'rgba(30, 120, 234, 0.2)' : 'rgba(0, 120, 212, 0.1)',
                  outline: 'none',
                }
              }}
            >
              {/* VS Code-like folder expand/collapse icon */}
              <Box sx={{
                minWidth: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isExpanded ?
                  <ExpandMoreIcon fontSize="small" sx={{ fontSize: '1rem', opacity: 0.7 }} /> :
                  <ChevronRightIcon fontSize="small" sx={{ fontSize: '1rem', opacity: 0.7 }} />}
              </Box>

              {/* Folder Icon - VS Code style */}
              <ListItemIcon sx={{
                minWidth: 28,
                ml: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {isExpanded ?
                  <FolderOpenIcon sx={{
                    fontSize: '1.25rem',
                    color: theme.palette.mode === 'dark' ? '#B8B8B8' : '#A0A0A0'
                  }} /> :
                  <FolderIcon sx={{
                    fontSize: '1.25rem',
                    color: theme.palette.mode === 'dark' ? '#B8B8B8' : '#A0A0A0'
                  }} />}
              </ListItemIcon>

              {/* Folder name */}
              <ListItemText
                primary={key}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: {
                    fontSize: '0.85rem',
                    fontWeight: 400,
                    fontFamily: theme.typography.code.fontFamily,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }}
              />

              {/* Add file/folder button that shows on hover */}
              <IconButton
                size="small"
                className="add-button"
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentPath(currentPath);
                  handleAddMenuOpen(event);
                }}
                sx={{
                  opacity: 0,
                  transition: 'opacity 0.15s',
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                <AddIcon sx={{ fontSize: '0.85rem' }} />
              </IconButton>
            </ListItemButton>

            {/* Collapse children with VS Code-like animation */}
            <Collapse in={isExpanded} timeout={100} unmountOnExit>
              <List component="div" disablePadding>
                <Box sx={{
                  '& > .MuiListItemButton-root': {
                    paddingLeft: theme => `${theme.spacing(2)}`,
                    borderLeft: '30px transparent solid',
                  }
                }}>
                  {renderTree(value.children, currentPath)}
                </Box>
              </List>
            </Collapse>
          </React.Fragment>
        );
      } else {
        return (
          <ListItemButton
            key={currentPath}
            onClick={() => onFileOpen(currentPath)}
            disableRipple
            sx={{
              pl: indentationLevel * 1.5 + 2.5,
              py: 0.25,
              minHeight: 24,
              borderRadius: 0,
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              },
              '&:focus': {
                backgroundColor: isDarkMode ? 'rgba(30, 120, 234, 0.2)' : 'rgba(0, 120, 212, 0.1)',
                outline: 'none',
              }
            }}
          >
            {/* File icon with VS Code-like styling */}
            <ListItemIcon sx={{
              minWidth: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getFileIcon(key)}
            </ListItemIcon>

            {/* File name */}
            <ListItemText
              primary={key}
              primaryTypographyProps={{
                variant: 'body2',
                sx: {
                  fontSize: '0.85rem',
                  fontWeight: 400,
                  fontFamily: theme.typography.code.fontFamily,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            />
          </ListItemButton>
        );
      }
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.background.sidebar,
        borderRight: `1px solid ${theme.palette.border.main}`,
        '& .MuiListItemButton-root': {
          py: 0.5,
          px: 1,
          borderRadius: '3px',
          mx: 0.5,
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          },
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.selected
            }
          }
        },
        '& .MuiListItemIcon-root': {
          minWidth: 28,
          color: theme.palette.text.secondary
        },
        '& .MuiListItemText-root': {
          margin: 0,
          '& .MuiTypography-root': {
            fontSize: '0.875rem',
            fontWeight: 400
          }
        },
        '& .MuiCollapse-root': {
          '& .MuiListItemButton-root': {
            pl: (depth) => depth * 2 + 1
          }
        }
      }}
    >
      {/* VS Code-like Explorer header with collapsible sections */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}>
        {/* Explorer header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '0.05rem',
              textTransform: 'uppercase',
              color: theme => theme.palette.text.secondary,
              opacity: 0.9,
            }}
          >
            EXPLORER
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="New File">
              <IconButton
                size="small"
                onClick={() => handleNewItem('file')}
                sx={{
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                <NoteAddIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="New Folder">
              <IconButton
                size="small"
                onClick={() => handleNewItem('folder')}
                sx={{
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                <CreateNewFolderIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Explorer">
              <IconButton
                size="small"
                sx={{
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                <Box component="span" sx={{
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>↻</Box>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* File tree with VS Code styling */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List component="nav" aria-label="file explorer" sx={{ py: 0 }}>
          {renderTree(files)}
        </List>
      </Box>

      {/* Add Menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            boxShadow: theme => theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.5)'
              : '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: 1,
          }
        }}
      >
        <MenuItem onClick={() => handleNewItem('file', currentPath)}>
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New File</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleNewItem('folder', currentPath)}>
          <ListItemIcon>
            <CreateNewFolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New Folder</ListItemText>
        </MenuItem>
      </Menu>

      {/* New File/Folder Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogType === 'file' ? 'Create New File' : 'Create New Folder'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={dialogType === 'file' ? 'File Name' : 'Folder Name'}
            type="text"
            fullWidth
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={dialogType === 'file' ? 'example.js' : 'example-folder'}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateItem}
            variant="contained"
            disabled={!newItemName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FileExplorer;