import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTheme } from '@mui/material/styles';
import FileTabs from './FileTabs';
import Editor from './Editor';
import Terminal from './Terminal';

function EditorContent({
  code,
  setCode,
  language,
  darkMode,
  onExecute,
  output,
  isLoading,
  openFiles,
  currentFile,
  onTabChange,
  onTabClose,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getLanguageFromPath = (path) => {
    if (!path) return language;
    const extension = path.split('.').pop().toLowerCase();

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
      rs: 'rust',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
    };

    return langMap[extension] || language;
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-editor)',
        '& > .editor-container': {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: 'var(--bg-editor)',
          borderBottom: '1px solid var(--border-main)'
        }
      }}
    >
      <FileTabs 
        openFiles={openFiles}
        currentFile={currentFile}
        onTabChange={onTabChange}
        onTabClose={onTabClose}
      />
      <Box className="editor-container">
        <Editor
          code={code}
          language={getLanguageFromPath(currentFile)}
          onCodeChange={setCode}
          onRun={onExecute}
          isRunning={isLoading}
          darkMode={isDark}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}
        >
          <Button
            variant="contained"
            color="success"
            onClick={onExecute}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
            sx={{
              backgroundColor: 'var(--button-secondary-bg)',
              '&:hover': {
                backgroundColor: 'var(--button-secondary-hover)',
              },
              height: 32,
              minWidth: 32,
              px: 2,
              color: 'var(--button-secondary-text)'
            }}
          >
            Run
          </Button>
        </Box>
      </Box>
      <Terminal output={output} />
    </Box>
  );
}

export default EditorContent;
