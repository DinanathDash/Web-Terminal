// VS Code-like theme with Material 3 design principles
import { createTheme } from '@mui/material/styles';

const theme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#58a6ff', // GitHub blue
      light: '#79c0ff',
      dark: '#388bfd',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3fb950', // GitHub green
      light: '#56d364',
      dark: '#26a641',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0d1117', // GitHub dark background
      paper: '#0d1117',
      sidebar: '#010409',
      activityBar: '#010409',
      editor: '#0d1117',
      editorGroup: '#010409',
      tab: '#010409',
      activeTab: '#0d1117',
      runButton: '#238636', // GitHub green for run button
      runButtonHover: '#2ea043',
      terminal: '#010409', // Terminal background
      header: '#010409', // Header background
      statusBar: '#010409', // Status bar background
    },
    text: {
      primary: '#e6edf3', // GitHub brighter text
      secondary: '#7d8590',
      disabled: '#484f58',
      hint: '#6e7681',
    },
    divider: '#21262d',
    border: {
      main: '#30363d',
      light: '#21262d',
      dark: '#484f58',
    },
    action: {
      active: 'rgba(255, 255, 255, 0.7)',
      hover: 'rgba(177, 186, 196, 0.12)',
      selected: 'rgba(56, 139, 253, 0.15)',
      disabled: 'rgba(110, 118, 129, 0.3)',
      disabledBackground: '#161b22',
    },
    fileIcons: {
      folder: '#54aeff',
      javascript: '#f1e05a',
      typescript: '#3178c6',
      react: '#61dafb',
      html: '#e34c26',
      css: '#563d7c',
      json: '#40a0f0',
      markdown: '#1f6feb',
      python: '#3572A5',
      java: '#b07219',
      ruby: '#701516',
      php: '#4F5D95',
      cpp: '#f34b7d',
      go: '#00ADD8',
      rust: '#dea584',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 13,
    htmlFontSize: 16,
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.75rem', fontWeight: 600 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1.1rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem' },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    code: {
      fontFamily: 'Menlo, Monaco, "SF Mono", Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },
  shape: {
    borderRadius: 4,
  },
  shadows: [
    'none',
    '0 0 transparent',
    '0 0 0 1px #30363d',
    '0 0 0 1px #30363d, 0 4px 8px #010409',
    '0 0 0 1px #30363d, 0 8px 16px #010409',
    '0 0 0 1px #30363d, 0 16px 32px #010409',
    ...Array(20).fill('0 0 0 1px #30363d, 0 16px 32px #010409'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '5px 12px',
          lineHeight: 1.5,
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        containedPrimary: {
          backgroundColor: '#238636',
          '&:hover': {
            backgroundColor: '#2ea043',
          },
        },
        outlinedPrimary: {
          borderColor: '#30363d',
          color: '#58a6ff',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '4px',
          transition: 'background-color 0.2s, color 0.2s',
          borderRadius: '6px',
          color: '#7d8590',
          '&:hover': {
            backgroundColor: 'rgba(177, 186, 196, 0.12)',
            color: '#e6edf3',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: '-0.15px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #30363d',
          borderRadius: '6px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 0,
          padding: '0 12px',
          height: '48px',
          fontWeight: 400,
          fontSize: '0.875rem',
          letterSpacing: '-0.15px',
          color: '#7d8590',
          '&.Mui-selected': {
            color: '#e6edf3',
            fontWeight: 500,
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '48px !important',
          borderBottom: '1px solid #21262d',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
            backgroundColor: '#010409',
            borderRadius: '6px',
            '& fieldset': {
              borderColor: '#30363d',
            },
            '&:hover fieldset': {
              borderColor: '#6e7681',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#58a6ff',
              borderWidth: '1px',
            }
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            color: '#7d8590',
            '&.Mui-focused': {
              color: '#58a6ff',
            }
          }
        }
      }
    },
    MuiTerminal: {
      styleOverrides: {
        root: {
          backgroundColor: '#010409',
          borderRadius: '6px',
          border: '1px solid #30363d',
          '& .xterm-viewport': {
            '&::-webkit-scrollbar': {
              width: '14px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#30363d',
              border: '4px solid transparent',
              borderRadius: '7px',
              backgroundClip: 'padding-box',
              '&:hover': {
                backgroundColor: '#6e7681',
              }
            }
          }
        }
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: '4px 0',
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          margin: '0 4px',
          padding: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(177, 186, 196, 0.12)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(56, 139, 253, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(56, 139, 253, 0.25)',
            }
          }
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#161b22',
          boxShadow: '0 0 0 1px #30363d, 0 4px 8px #010409',
          borderRadius: '6px',
          border: '1px solid #30363d',
        }
      }
    },
  },
};

export const getVSCodeTheme = () => {
  return createTheme(theme);
};

export default getVSCodeTheme;
