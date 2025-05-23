// Terminal keyboard utilities for cross-platform compatibility
import { useCallback, useRef } from 'react';

// Custom hook for terminal keyboard input
export default function useTerminalKeys(options = {}) {
  const {
    onCommand,
    terminalRef,
    xtermRef,
    isRunning = false
  } = options;
  
  const inputBufferRef = useRef('');
  const promptRef = useRef(options.prompt || '> ');
  
  // Handle Enter key
  const handleEnterKey = useCallback(() => {
    if (!xtermRef?.current) return;
    
    // Echo a newline
    xtermRef.current.write('\r\n');
    
    const command = inputBufferRef.current.trim();
    if (command && typeof onCommand === 'function') {
      onCommand(command);
    } else {
      // Write prompt on empty enter
      xtermRef.current.write(promptRef.current);
    }
    
    // Clear input buffer
    inputBufferRef.current = '';
  }, [onCommand, xtermRef]);
  
  // Handle backspace/delete
  const handleDeleteKey = useCallback(() => {
    if (!xtermRef?.current) return;
    
    // Only delete if there's text in the buffer
    if (inputBufferRef.current.length > 0) {
      // Update internal buffer
      inputBufferRef.current = inputBufferRef.current.slice(0, -1);
      
      // Visually move cursor back and clear character
      xtermRef.current.write('\b \b');
    }
  }, [xtermRef]);
  
  // Handle regular text input
  const handleTextInput = useCallback((key) => {
    if (!xtermRef?.current) return;
    
    // Add to internal buffer
    inputBufferRef.current += key;
    
    // Echo to terminal
    xtermRef.current.write(key);
  }, [xtermRef]);
  
  // Main key event handler
  const handleKeyEvent = useCallback((ev) => {
    if (!xtermRef?.current) return;
    
    const key = ev.key;
    const keyCode = ev.keyCode;
    
    // Optional logging for debugging
    // console.log('Terminal key:', key, 'Code:', keyCode);
    
    // Handle clipboard operations
    if ((ev.ctrlKey || ev.metaKey) && (key === 'c' || key === 'C')) {
      const selection = document.getSelection().toString();
      if (selection) {
        navigator.clipboard.writeText(selection);
      }
    } else if ((ev.ctrlKey || ev.metaKey) && (key === 'v' || key === 'V')) {
      navigator.clipboard.readText().then(text => {
        if (text && xtermRef.current) {
          xtermRef.current.write(text);
        }
      });
    }
  }, [handleEnterKey, handleDeleteKey, handleTextInput, isRunning, onCommand, xtermRef]);
  
  // Direct DOM event handler (for problematic keys)
  const handleDOMKeyDown = useCallback((ev) => {
    // We specifically handle delete & backspace for cross-platform consistency
    if (ev.key === 'Backspace' || ev.key === 'Delete' || ev.keyCode === 8 || ev.keyCode === 46) {
      ev.preventDefault();
      handleDeleteKey();
    }
  }, [handleDeleteKey]);
  
  // Focus the terminal
  const focusTerminal = useCallback(() => {
    if (terminalRef?.current) {
      terminalRef.current.focus();
    }
  }, [terminalRef]);
  
  // Set or update the prompt
  const setPrompt = useCallback((prompt) => {
    promptRef.current = prompt;
  }, []);
  
  // Get current input buffer value
  const getInputBuffer = useCallback(() => {
    return inputBufferRef.current;
  }, []);
  
  // Reset input buffer 
  const resetInputBuffer = useCallback(() => {
    inputBufferRef.current = '';
  }, []);
  
  return {
    handleKeyEvent,
    handleDOMKeyDown,
    focusTerminal,
    setPrompt,
    getInputBuffer,
    resetInputBuffer
  };
}
