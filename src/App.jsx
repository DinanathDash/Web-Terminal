import React, { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { ThemeProvider } from '@mui/material/styles';
import Header from './components/Header';
import CodeEditor from './components/Editor';
import Terminal from './components/Terminal';
import FileExplorer from './components/FileExplorer';
import FileTabs from './components/FileTabs';
import StatusBar from './components/StatusBar';
import axios from 'axios';
import io from 'socket.io-client';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { getVSCodeTheme } from './theme';
import { applyThemeClass } from './themeUtils';
import './App.css';
import './macosTerminal.css';
import './themeColors.css';

// Backend URL
// Use environment variable or fallback to local server during development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

// Initial file structure for the explorer
const initialFiles = {
  'README.md': { 
    type: 'file', 
    content: '# Web Terminal\nA modern code execution platform in your browser.' 
  },
  'demo': {
    type: 'folder',
    children: {
      'example.js': {
        type: 'file',
        content: '// Write your code here\nconsole.log("Hello World!");'
      }
    }
  }
};

// Get initial language from file extension
const getInitialLanguage = (path) => {
  const extension = path?.split('.').pop()?.toLowerCase();
  const langMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    rb: 'ruby',
    go: 'go',
    rs: 'rust'
  };
  return langMap[extension] || 'javascript';
};

// Get default code for a language
const getDefaultCode = (lang) => {
  switch (lang) {
    case 'python':
      return `#!/usr/bin/env python3
"""
Python code template with type hints.
"""
from typing import List, Dict, Optional, Any, Tuple


def greet(name: str) -> str:
    """Return a greeting message for the given name."""
    return f"Hello, {name}!"


def main() -> None:
    """Main entry point of the program."""
    message = greet("World")
    print(message)


if __name__ == "__main__":
    main()
`;
    case 'java':
      return `// Java program
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
`;
    case 'c':
      return `// C program
#include <stdio.h>

int main() {
    printf("Hello World!\\n");
    return 0;
}
`;
    case 'cpp':
      return `// C++ program
#include <iostream>

int main() {
    std::cout << "Hello World!" << std::endl;
    return 0;
}
`;
    case 'javascript':
    default:
      return '// Write your code here\nconsole.log("Hello World!");';
  }
};

function App() {
  // File management state
  const defaultFile = '/demo/example.js';
  const [files, setFiles] = useState(initialFiles);
  const [currentFile, setCurrentFile] = useState(defaultFile);
  const [openFiles, setOpenFiles] = useState([defaultFile]);

  // Editor state
  const [language, setLanguage] = useState(() => getInitialLanguage(defaultFile));
  const [code, setCode] = useState(() => getDefaultCode(getInitialLanguage(defaultFile)));
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState({ output: '', error: false });
  
  // VS Code UI state
  const [activeSearch, setActiveSearch] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [mobileExplorerOpen, setMobileExplorerOpen] = useState(false);

  // Socket connection
  const [socket, setSocket] = useState(null);
  const [serverConnected, setServerConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Get theme
  const theme = getVSCodeTheme();
  
  // Initialize socket connection
  useEffect(() => {
    console.log(`Connecting to backend at: ${BACKEND_URL}`);
    
    // For Vercel serverless deployment configuration
    const newSocket = io(BACKEND_URL, {
      path: '/socket.io',
      transports: ['polling', 'websocket'], // Enable both polling and websocket
      reconnectionDelayMax: 5000,
      reconnection: true,
      reconnectionAttempts: 10,
      timeout: 20000,
      auth: {
        serverOffset: new Date().getTimezoneOffset()
      },
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setServerConnected(true);
      setConnectionError(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setServerConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError(true);
      setServerConnected(false);
    });

    newSocket.on('output', (data) => {
      // Handle both string and object formats for backward compatibility
      const dataOutput = typeof data === 'string' ? data : data.output;
      const isError = typeof data === 'object' && data.error;
      
      setOutput(prev => ({
        output: isError ? 
          `${prev.output}\x1b[31m${dataOutput}\x1b[0m` : 
          `${prev.output}${dataOutput}`,
        error: isError || prev.error
      }));
    });

    newSocket.on('execution-complete', () => {
      setIsRunning(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Apply dark theme class on mount
  useEffect(() => {
    applyThemeClass();
  }, []);

  // Handle mobile explorer toggle
  const handleMobileExplorerToggle = () => {
    setMobileExplorerOpen(!mobileExplorerOpen);
  };

  useEffect(() => {
    if (currentFile) {
      setMobileExplorerOpen(false);
    } else {
      setMobileExplorerOpen(true);
    }
  }, [currentFile]);

  // Normalize file paths
  const normalizePath = (path) => {
    if (!path) return '/';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return normalizedPath === '/' ? '/' : normalizedPath.replace(/\/+/g, '/').replace(/\/$/, '');
  };

  // Safely access file structure
  const safelyGetFile = (path) => {
    if (!path) return null;
    
    const normalizedPath = normalizePath(path);
    const parts = normalizedPath.split('/').filter(Boolean);
    
    let current = files;
    for (const part of parts) {
      if (!current[part] || current[part].type === 'file') {
        return null;
      }
      if (current[part].type === 'folder') {
        current = current[part].children;
      } else {
        return current[part];
      }
    }
    return current;
  };

  // Create file in structure
  const createFileInStructure = (path, content = '') => {
    const normalizedPath = normalizePath(path);
    const parts = normalizedPath.split('/').filter(Boolean);
    const fileName = parts.pop();
    
    let current = files;
    let currentPath = '';
    
    for (const part of parts) {
      currentPath += '/' + part;
      if (!current[part]) {
        current[part] = {
          type: 'folder',
          children: {}
        };
      }
      current = current[part].children;
    }
    
    current[fileName] = {
      type: 'file',
      content: content
    };
    
    setFiles({ ...files });
  };

  // Handle file saving
  const handleSaveFile = () => {
    if (currentFile) {
      const normalizedPath = normalizePath(currentFile);
      createFileInStructure(normalizedPath, code);
      setSnackbarMessage(`Saved ${normalizedPath}`);
      setSnackbarOpen(true);
    }
  };

  // Run code
  const handleRunCode = async () => {
    if (isRunning) return;

    if (currentFile) {
      const normalizedPath = normalizePath(currentFile);
      const fileObj = safelyGetFile(normalizedPath);
      
      if (!fileObj) {
        console.log(`Creating file before execution: ${normalizedPath}`);
        createFileInStructure(normalizedPath, code);
      }
    }

    setIsRunning(true);
    setOutput({
      output: '',  // Clear output before running
      error: false
    });

    const codeToRun = code;
    const currentLanguage = language; // Capture current language state

    console.log(`Executing code with language: ${currentLanguage} for file: ${currentFile}`);

    if (socket && serverConnected) {
      try {
        socket.emit('execute', {
          code: codeToRun,
          language: currentLanguage,
          filePath: currentFile
        });
      } catch (err) {
        console.error('Error executing code:', err);
        setOutput({
          output: `\r\n\x1b[31mError: ${err.message}\x1b[0m\r\n`,
          error: true
        });
        setIsRunning(false);
      }
    } else {
      setOutput({
        output: `\r\n\x1b[31mError: ${language} execution requires server connection.\x1b[0m\r\n\x1b[33mTry reconnecting with the 'reconnect' command.\x1b[0m\r\n`,
        error: true
      });
      setIsRunning(false);
    }
  };

  // Stop execution
  const handleStopExecution = () => {
    if (!isRunning) return;
    
    setIsRunning(false);
    
    if (serverConnected && socket) {
      setOutput(prev => ({
        output: prev.output + '\n\x1b[31m[Execution terminated by user]\x1b[0m\n',
        error: true
      }));
      
      socket.emit('stop-execution');
      socket.emit('SIGINT');
    }
  };

  // Handle terminal commands
  const handleTerminalCommand = (command) => {
    if (!command || command.startsWith('_')) return;

    if (command === 'reconnect' && socket) {
      socket.connect();
    }
  };

  // Handle file selection
  const handleFileSelect = (path) => {
    const normalizedPath = normalizePath(path);
    
    if (normalizedPath.includes('.')) {
      if (!openFiles.includes(normalizedPath)) {
        setOpenFiles([...openFiles, normalizedPath]);
      }
      setCurrentFile(normalizedPath);
      
      // Get the language first
      const newLanguage = getInitialLanguage(normalizedPath);
      console.log(`File selected: ${normalizedPath}, language set to: ${newLanguage}`);
      
      // Important: Set language immediately for proper syntax highlighting
      setLanguage(newLanguage);
      
      // Then get file content or use default code for the language
      const fileContent = safelyGetFile(normalizedPath);
      if (fileContent && fileContent.content) {
        setCode(fileContent.content);
      } else {
        // For new files, get proper template code
        setCode(getDefaultCode(newLanguage));
      }
    }
  };

  // Close file
  const handleCloseFile = (path) => {
    const newOpenFiles = openFiles.filter(f => f !== path);
    setOpenFiles(newOpenFiles);
    
    if (path === currentFile && newOpenFiles.length > 0) {
      setCurrentFile(newOpenFiles[newOpenFiles.length - 1]);
      handleFileSelect(newOpenFiles[newOpenFiles.length - 1]);
    } else if (newOpenFiles.length === 0) {
      setCurrentFile('');
      setCode('');
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        bgcolor: 'background.default'
      }}>
        <Header onSave={handleSaveFile} onMobileExplorerToggle={handleMobileExplorerToggle} />
        
        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Box sx={{ 
            width: { xs: '50%', sm: 240 },
            position: { xs: 'absolute', sm: 'relative' },
            display: 'flex',
            flexShrink: 0,
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: theme.palette.background.sidebar,
            zIndex: 10,
            transform: {
              xs: mobileExplorerOpen ? 'translateX(0)' : 'translateX(-100%)',
              sm: 'translateX(0)'
            },
            transition: 'transform 0.3s ease-in-out',
            height: '100%',
            left: 0
          }}>
            <FileExplorer 
              files={files}
              onFileOpen={handleFileSelect}
              setFiles={setFiles}
              onClose={handleMobileExplorerToggle}
            />
          </Box>
          
          {/* Backdrop for mobile */}
          {mobileExplorerOpen && (
            <Box
              onClick={handleMobileExplorerToggle}
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9,
                display: { sm: 'none' }
              }}
            />
          )}
          
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: theme.palette.background.editor
          }}>
            <FileTabs 
              openFiles={openFiles}
              currentFile={currentFile}
              onSelectFile={handleFileSelect}
              onCloseFile={handleCloseFile}
            />
            
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: 0,
            }}>
              <CodeEditor 
                code={code}
                language={language}
                onCodeChange={setCode}
                onRun={handleRunCode}
                onStop={handleStopExecution}
                isRunning={isRunning}
              />
            </Box>
              
            <Paper
              elevation={0}
              sx={{
                height: { xs: '45%', sm: '35%' },
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: theme.palette.background.terminal,
                position: 'relative',
                borderRadius: 0,
              }}
            >
              <Terminal 
                output={output}
                isConnected={serverConnected}
                onCommand={handleTerminalCommand}
                isRunning={isRunning}
                language={language}
              />
            </Paper>
          </Box>
        </Box>
        
        <StatusBar 
          currentFile={currentFile}
          language={language}
        />
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
