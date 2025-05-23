import React from 'react';
import { Editor } from '@monaco-editor/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CircularProgress from '@mui/material/CircularProgress';
import { getMonacoTheme } from '../themeUtils';

// Define language ID mapping function
const getLanguageId = (lang) => {
  const languageMap = {
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'ruby': 'ruby',
    'go': 'go',
    'rust': 'rust',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'markdown': 'markdown'
  };

  return languageMap[lang.toLowerCase()] || 'plaintext';
};

function CodeEditor({ code, language, onCodeChange, onRun, onStop, isRunning }) {
  const editorRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [editorReady, setEditorReady] = React.useState(false);
  const [editorError, setEditorError] = React.useState(null);
  const [editorLanguage, setEditorLanguage] = React.useState(getLanguageId(language || 'javascript'));

  // Handle editor mounting and theme configuration
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditorReady(true);

    // Define GitHub Dark theme based on our CSS variables
    monaco.editor.defineTheme('github-dark', getMonacoTheme());
    monaco.editor.setTheme('github-dark');
    
    // Ensure the editor layout is updated when the container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (editorRef.current) {
        try {
          editorRef.current.layout();
        } catch (err) {
          console.error('Error updating editor layout:', err);
          setEditorError('Error updating editor layout');
        }
      }
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  };
  
  // Update editor language when prop changes
  React.useEffect(() => {
    const newLanguage = getLanguageId(language || 'javascript');
    console.log(`Setting editor language to: ${newLanguage} from language prop: ${language}`);
    setEditorLanguage(newLanguage);
  }, [language]);
  
  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#010409'
      }}
    >
      <Editor
        height="100%"
        language={editorLanguage}
        defaultValue={code}
        value={code}
        onChange={onCodeChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 13,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'all',
          lineNumbers: 'on',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 14,
            horizontalScrollbarSize: 14
          }
        }}
      />
      
      {/* Error display */}
      {editorError && (
        <Box sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: '#f44336',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 1,
          fontSize: '0.875rem'
        }}>
          {editorError}
        </Box>
      )}
      
      {/* Run/Stop button */}
      <Box sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1
      }}>
        <Button
          variant="contained"
          color={isRunning ? 'error' : 'success'}
          onClick={isRunning ? onStop : onRun}
          startIcon={
            isRunning ? 
              <StopIcon /> : 
              editorReady ? 
                <PlayArrowIcon /> :
                <CircularProgress size={16} />
          }
          disabled={!editorReady}
          sx={{
            height: 32,
            minWidth: 32,
            px: 2
          }}
        >
          {isRunning ? 'Stop' : 'Run'}
        </Button>
      </Box>
    </Box>
  );
}

export default CodeEditor;