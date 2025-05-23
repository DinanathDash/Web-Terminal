import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import ReplayIcon from '@mui/icons-material/Replay';
import { getTerminalTheme } from '../themeUtils';
import useTerminalKeys from '../hooks/useTerminalKeys';
import 'xterm/css/xterm.css';

// Add clipboard API fallback for older browsers
const copyToClipboard = (text) => {
  // Try to use the clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  } 
  // Fall back to document.execCommand for older browsers
  else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful ? Promise.resolve() : Promise.reject('Copy failed');
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.reject(err);
    }
  }
};

// Platform detection for keyboard handling
const isWindows = navigator.platform.toLowerCase().includes('win');
const isMac = navigator.platform.toLowerCase().includes('mac');
const PLATFORM_TEXT = isWindows ? 'Windows' : (isMac ? 'macOS' : 'Linux');
const CTRL_KEY_TEXT = isMac ? '⌘' : 'Ctrl';  // Basic clipboard shortcuts
const KEYBOARD_SHORTCUTS = {
  COPY: isMac ? '⌘+C' : 'Ctrl+Shift+C',
  PASTE: isMac ? '⌘+V' : 'Ctrl+Shift+V'
};

function Terminal({ output, onCommand, isRunning, isConnected = true, language = 'javascript' }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const isInitialMount = useRef(true);  // Moved to top level
  const [isTerminalReady, setIsTerminalReady] = useState(false);
  const [inputBuffer, setInputBuffer] = useState('');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastOutput, setLastOutput] = useState(null);
  const [packageStatus, setPackageStatus] = useState({
    active: false,
    status: 'idle', // idle, detecting, installing, completed, error
    language: null,
    packages: [],
    progress: 0,
    message: ''
  });
  
  // Track current language for prompt updates
  const currentLanguageRef = useRef(language);
  const promptRef = useRef(getPromptForLanguage(language));
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Get language-specific prompt
  function getPromptForLanguage(lang) {
    switch(lang?.toLowerCase()) {
      case 'python': 
        return 'python> ';
      case 'java': 
        return 'java> ';
      case 'c':
        return 'c> ';
      case 'cpp': 
        return 'cpp> ';
      case 'ruby': 
        return 'ruby> ';
      case 'go': 
        return 'go> ';
      case 'rust': 
        return 'rust> ';
      case 'javascript':
      default:
        return 'js> ';
    }
  }

  // Update currentLanguageRef whenever language prop changes
  useEffect(() => {
    currentLanguageRef.current = language;
    // Update prompt based on new language
    promptRef.current = getPromptForLanguage(language);
  }, [language]);

  // Store outputs to handle reconnection
  const outputHistoryRef = useRef([]);
  const MAX_OUTPUT_HISTORY = 50;

  // Define handlePackageEvents using useCallback to memoize it
  const handlePackageEvents = useCallback((socket) => {
    socket.on('packages-detected', (data) => {
      const { packages, language } = data;
      setPackageStatus(prev => ({
        ...prev,
        active: true,
        status: 'detecting',
        language,
        packages,
        message: `Detected ${packages.length} required packages`
      }));
    });
    
    socket.on('packages-installing', (data) => {
      const { packages } = data;
      setPackageStatus(prev => ({
        ...prev,
        status: 'installing',
        packages,
        progress: 0,
        message: `Installing ${packages.length} packages...`
      }));
    });
    
    socket.on('packages-installed', () => {
      setPackageStatus(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        message: 'Packages installed successfully'
      }));
      
      // Hide the status after a short delay
      setTimeout(() => {
        setPackageStatus(prev => ({
          ...prev,
          active: false
        }));
      }, 3000);
    });
    
    socket.on('execution-status', (data) => {
      const { status } = data;
      
      switch (status) {
        case 'installing-packages':
          setPackageStatus(prev => ({
            ...prev,
            active: true,
            status: 'installing',
            progress: 30,
            message: 'Installing required packages...'
          }));
          break;
        case 'packages-installed':
          setPackageStatus(prev => ({
            ...prev,
            progress: 100,
            message: 'Package installation complete'
          }));
          break;
        case 'compiling':
          setPackageStatus(prev => ({
            ...prev,
            active: false
          }));
          break;
        default:
          break;
      }
    });
    
    return () => {
      socket.off('packages-detected');
      socket.off('packages-installing');
      socket.off('packages-installed');
      socket.off('execution-status');
    };
  }, [setPackageStatus]);

  // Add reconnect button with status indication
  const handleReconnect = () => {
    setIsReconnecting(true);
    onCommand('reconnect');
    
    // Reset reconnecting state after a timeout
    setTimeout(() => {
      setIsReconnecting(false);
    }, 3000);
  };
  
  // Package installation status UI - Shows compact UI in the top left corner
  const renderPackageStatus = () => {
    if (!packageStatus.active) return null;
    
    const getStatusColor = () => {
      switch (packageStatus.status) {
        case 'detecting': return 'info';
        case 'installing': return 'warning';
        case 'completed': return 'success';
        case 'error': return 'error';
        default: return 'default';
      }
    };
    
    const getStatusLabel = () => {
      switch (packageStatus.status) {
        case 'detecting': return 'Detecting Packages...';
        case 'installing': return `Installing ${packageStatus.packages.length} Packages...`;
        case 'completed': return 'Installation Complete';
        case 'error': return 'Installation Error';
        default: return 'Package Manager';
      }
    };

    // Status is shown in the explorer area with proper elevation and non-intrusive UI
    return (
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -38,  // Position above the terminal in explorer area
          left: 10,
          maxWidth: 220,
          zIndex: 2,
          backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
          borderRadius: '4px',
          padding: '4px 8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          // Auto-transitions in and out
          animation: packageStatus.active ? 'fadeIn 0.3s ease-in-out' : 'fadeOut 0.3s ease-in-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(-10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          },
          '@keyframes fadeOut': {
            from: { opacity: 1, transform: 'translateY(0)' },
            to: { opacity: 0, transform: 'translateY(-10px)' }
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={getStatusLabel()} 
            size="small" 
            color={getStatusColor()}
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
          {packageStatus.status === 'installing' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={packageStatus.progress} 
                sx={{ flexGrow: 1, height: 4, borderRadius: 2, minWidth: 40 }}
              />
              <Box component="span" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                {packageStatus.progress}%
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  };
  
  // Status indicator for terminal
  const renderStatus = () => {
    return (
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 2,
          display: 'flex',
          gap: 1
        }}
      >
        
        {!isConnected && (
          <Chip 
            icon={<ReplayIcon fontSize="small" />}
            label="Disconnected" 
            size="small"
            color="error"
            onClick={handleReconnect}
            disabled={isReconnecting}
            sx={{ height: 24 }}
          />
        )}
        
        {isConnected && (
          <Chip 
            label="Connected" 
            size="small"
            color="success"
            variant="outlined"
            sx={{ height: 24 }}
          />
        )}
      </Box>
    );
  };

  // Show terminal help content
  const showHelp = useCallback(() => {
    if (!xtermRef.current || !isTerminalReady) return;
    
    xtermRef.current.writeln('\r\n\x1b[36m=== Terminal Controls ===\x1b[0m');
    xtermRef.current.writeln('\x1b[33mCopy text:\x1b[0m ' + KEYBOARD_SHORTCUTS.COPY);
    xtermRef.current.writeln('\x1b[33mPaste text:\x1b[0m ' + KEYBOARD_SHORTCUTS.PASTE);
    xtermRef.current.writeln('\x1b[36m====================\x1b[0m\r\n');
    xtermRef.current.write(promptRef.current);
  }, [isTerminalReady]);

  // Register handlers only if they are needed
  useEffect(() => {
    const socketHandlers = {
      handlePackageEvents
    };
    
    // Store handlers internally
    if (typeof onCommand === 'function') {
      onCommand('_registerHandlers', socketHandlers);
    }
  }, [handlePackageEvents]);

  // Initialize terminal focus and clipboard handlers
  const terminalKeys = useTerminalKeys({
    terminalRef,
    xtermRef
  });

  // Update the prompt when it changes
  useEffect(() => {
    if (terminalKeys && promptRef.current) {
      terminalKeys.setPrompt(promptRef.current);
    }
  }, [terminalKeys, promptRef.current]);

  // Initialize xterm.js
  useEffect(() => {
    if (!terminalRef.current) return;

    xtermRef.current = new XTerm({
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'block',
      theme: getTerminalTheme(isDark),
      allowTransparency: false,
      scrollback: 1000,
      cols: 100, // Set fixed width to prevent wrapping issues
      rows: 24  // Set reasonable default height
    });

    // Create and load addons
    fitAddonRef.current = new FitAddon();
    xtermRef.current.loadAddon(fitAddonRef.current);

    // Open terminal
    xtermRef.current.open(terminalRef.current);
    fitAddonRef.current.fit();
    
    // Initialize terminal with welcome message
    xtermRef.current.writeln('\r\nWelcome to Web Terminal\r\n');
    // Don't write any completion messages on initial load

    // Handle key input with enhanced platform compatibility
    xtermRef.current.onKey(e => {
      if (terminalKeys) {
        terminalKeys.handleKeyEvent(e.domEvent);
      }
    });

    setIsTerminalReady(true);

    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [isDark]);

  // Setup direct DOM keyboard events as fallback for problematic keys
  useEffect(() => {
    if (!terminalRef.current || !xtermRef.current || !isTerminalReady) return;
    
    // Add direct DOM-level keyboard event listeners using our hook
    const handleKeyDown = (e) => {
      terminalKeys.handleDOMKeyDown(e);
    };
    
    // Focus terminal on click
    const handleTerminalClick = () => {
      terminalKeys.focusTerminal();
    };
    
    terminalRef.current.addEventListener('keydown', handleKeyDown);
    terminalRef.current.addEventListener('click', handleTerminalClick);
    
    // Focus the terminal initially
    terminalKeys.focusTerminal();
    
    return () => {
      if (terminalRef.current) {
        terminalRef.current.removeEventListener('keydown', handleKeyDown);
        terminalRef.current.removeEventListener('click', handleTerminalClick);
      }
    };
  }, [isTerminalReady, terminalKeys]);

  // Handle output updates from props with proper wrapping
  useEffect(() => {
    if (xtermRef.current && output && isTerminalReady) {
      try {
        if (typeof output === 'object' && output.output) {
          const { output: text, error } = output;
          
          // Split output into lines and write each line separately
          const lines = text.split(/\r?\n/);
          lines.forEach((line, index) => {
            if (line.trim()) {  // Only process non-empty lines
              if (error) {
                xtermRef.current.writeln(`\x1b[31m${line}\x1b[0m`);
              } else {
                xtermRef.current.writeln(line);
              }
            }
          });
        } else if (typeof output === 'string') {
          const lines = output.split(/\r?\n/);
          lines.forEach(line => {
            if (line.trim()) {
              xtermRef.current.writeln(line);
            }
          });
        }

        // Scroll to the bottom
        xtermRef.current.scrollToBottom();
      } catch (e) {
        console.error('Error writing to terminal:', e);
      }
    }
  }, [output, isTerminalReady]);

  // Function to manually trigger a terminal fit if needed
  const triggerTerminalFit = useCallback(() => {
    if (fitAddonRef.current && terminalRef.current && 
        terminalRef.current.offsetWidth > 0 && 
        terminalRef.current.offsetHeight > 0) {
      try {
        fitAddonRef.current.fit();
      } catch (e) {
        console.error('Error triggering fit:', e);
      }
    }
  }, []);
  
  // Register right-click context menu for terminal
  useEffect(() => {
    if (terminalRef.current && isTerminalReady) {
      // Create context menu for right-click
      const createContextMenu = (event) => {
        event.preventDefault();
        
        // Remove any existing context menus
        const existingMenu = document.getElementById('terminal-context-menu');
        if (existingMenu) existingMenu.remove();
        
        // Create menu element
        const menu = document.createElement('div');
        menu.id = 'terminal-context-menu';
        menu.style.position = 'absolute';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.backgroundColor = isDark ? '#1e1e1e' : '#f5f5f5';
        menu.style.border = `1px solid ${isDark ? '#444' : '#ccc'}`;
        menu.style.borderRadius = '4px';
        menu.style.padding = '4px 0';
        menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        menu.style.zIndex = '9999';
        menu.style.minWidth = '120px';
        
        // Create copy item
        const copyItem = document.createElement('div');
        copyItem.innerText = 'Copy';
        copyItem.style.padding = '6px 14px';
        copyItem.style.cursor = 'pointer';
        copyItem.style.color = isDark ? '#ffffff' : '#333333';
        copyItem.style.fontSize = '13px';
        copyItem.addEventListener('mouseenter', () => {
          copyItem.style.backgroundColor = isDark ? '#2a2a2a' : '#e8e8e8';
        });
        copyItem.addEventListener('mouseleave', () => {
          copyItem.style.backgroundColor = 'transparent';
        });
        copyItem.addEventListener('click', () => {
          copyToClipboard(document.getSelection().toString());
          menu.remove();
        });
        
        // Create paste item
        const pasteItem = document.createElement('div');
        pasteItem.innerText = 'Paste';
        pasteItem.style.padding = '6px 14px';
        pasteItem.style.cursor = 'pointer';
        pasteItem.style.borderTop = `1px solid ${isDark ? '#444' : '#e0e0e0'}`;
        pasteItem.style.color = isDark ? '#ffffff' : '#333333';
        pasteItem.style.fontSize = '13px';
        pasteItem.addEventListener('mouseenter', () => {
          pasteItem.style.backgroundColor = isDark ? '#2a2a2a' : '#e8e8e8';
        });
        pasteItem.addEventListener('mouseleave', () => {
          pasteItem.style.backgroundColor = 'transparent';
        });
        pasteItem.addEventListener('click', async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (text && xtermRef.current) {
              // Add text to input buffer
              setInputBuffer(prev => prev + text);
              // Write text to terminal
              xtermRef.current.write(text);
            }
          } catch (e) {
            console.error('Paste failed:', e);
          }
          menu.remove();
        });
        
        // Add items to menu
        menu.appendChild(copyItem);
        menu.appendChild(pasteItem);
        
        // Add menu to document
        document.body.appendChild(menu);
        
        // Remove menu on click outside
        const removeMenu = (e) => {
          if (!menu.contains(e.target) && e.target !== menu) {
            menu.remove();
            document.removeEventListener('click', removeMenu);
          }
        };
        
        document.addEventListener('click', removeMenu);
      };
      
      // Add context menu event listener
      terminalRef.current.addEventListener('contextmenu', createContextMenu);
      
      // Cleanup
      return () => {
        if (terminalRef.current) {
          terminalRef.current.removeEventListener('contextmenu', createContextMenu);
        }
        
        // Remove any existing menus
        const existingMenu = document.getElementById('terminal-context-menu');
        if (existingMenu) existingMenu.remove();
      };
    }
  }, [isTerminalReady, isDark]);

  // Resize terminal when parent dimensions change
  useEffect(() => {
    // Use a short delay to ensure the DOM has had time to render
    const debouncedFit = setTimeout(triggerTerminalFit, 100);
    
    // Clean up timeout on unmount or when dependency changes
    return () => {
      clearTimeout(debouncedFit);
    };
  }, [triggerTerminalFit]);

  // Handle output updates from props with proper wrapping
  useEffect(() => {
    if (xtermRef.current && output && isTerminalReady) {
      try {
        if (typeof output === 'object' && output.output) {
          const { output: text, error } = output;
          
          // Split output into lines and write each line separately
          const lines = text.split(/\r?\n/);
          lines.forEach((line, index) => {
            if (line.trim()) {  // Only process non-empty lines
              if (error) {
                xtermRef.current.writeln(`\x1b[31m${line}\x1b[0m`);
              } else {
                xtermRef.current.writeln(line);
              }
            }
          });
        } else if (typeof output === 'string') {
          const lines = output.split(/\r?\n/);
          lines.forEach(line => {
            if (line.trim()) {
              xtermRef.current.writeln(line);
            }
          });
        }

        // Scroll to the bottom
        xtermRef.current.scrollToBottom();
      } catch (e) {
        console.error('Error writing to terminal:', e);
      }
    }
  }, [output, isTerminalReady]);

  // Display running indicator in terminal
  useEffect(() => {
    if (xtermRef.current && isTerminalReady) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      if (isRunning) {
        xtermRef.current.write('\r\n\x1b[33m[Execution started]\x1b[0m\r\n');
        xtermRef.current.write('\x1b[2m(Press Ctrl+C to stop)\x1b[0m\r\n');
      } else if (isRunning === false) {
        // Only show completion message if we were actually running something
        if (!isInitialMount.current) {
          xtermRef.current.write('\r\n\x1b[32m[Execution completed]\x1b[0m\r\n\r\n');
          xtermRef.current.write(promptRef.current);
          
          // Reset package status on execution completion
          setPackageStatus(prev => ({
            ...prev,
            active: false,
            status: 'idle',
            packages: [],
            progress: 0
          }));
        }
      }
    }
  }, [isRunning, isTerminalReady]);
  
  // Effect to update prompt when language changes
  useEffect(() => {
    if (language !== currentLanguageRef.current) {
      console.log(`Terminal language changed from ${currentLanguageRef.current} to ${language}`);
      currentLanguageRef.current = language;
      const newPrompt = getPromptForLanguage(language);
      promptRef.current = newPrompt;
      
      // Show language change in terminal if it's ready
      if (xtermRef.current && isTerminalReady && !isRunning) {
        xtermRef.current.write(`\r\n\x1b[34m[Switched to ${language} mode]\x1b[0m\r\n`);
        xtermRef.current.write(newPrompt);
      }
    }
  }, [language, isTerminalReady, isRunning]);
  
  // Effect to handle connection state changes
  useEffect(() => {
    if (xtermRef.current && isTerminalReady) {
      if (!isConnected && lastOutput !== 'disconnected') {
        // Show disconnection message in terminal
        xtermRef.current.write('\r\n\x1b[31m[Server disconnected. Reconnect to run code.]\x1b[0m\r\n\r\n');
        xtermRef.current.write(promptRef.current);
        setLastOutput('disconnected');
        
        // Also force reset package status
        setPackageStatus(prev => ({
          ...prev,
          active: false,
          status: 'idle',
          packages: [],
          progress: 0
        }));
      } else if (isConnected && lastOutput === 'disconnected') {
        // Show reconnection message
        xtermRef.current.write('\r\n\x1b[32m[Server connected. Ready to run code.]\x1b[0m\r\n\r\n');
        xtermRef.current.write(promptRef.current);
        setLastOutput(null);
      }
    }
  }, [isConnected, isTerminalReady, lastOutput]);
  
  // Export socket handling for parent component
  useEffect(() => {
    // Only register handlers once on mount
    const socketHandlers = {
      handlePackageEvents
    };
    
    // Make handlers available to parent through a ref
    if (typeof onCommand === 'function') {
      onCommand('registerHandlers', socketHandlers);
    }
    // This effect should only run once on mount, and when handlePackageEvents changes
    // Omit onCommand from deps to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePackageEvents]);
  
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: '200px',
        position: 'relative',
        backgroundColor: theme.palette.background.sidebar,
        borderTop: `1px solid ${theme.palette.border.main}`,
        '& .xterm': {
          height: '100%',
          padding: '8px'
        }
      }}
    >
      {renderStatus()}
      {renderPackageStatus()}
      
      <Box
        ref={terminalRef}
        sx={{
          height: '100%',
          width: '100%',
          overflow: 'hidden'
        }}
      />
    </Box>
  );
}

export default Terminal;