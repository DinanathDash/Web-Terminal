/**
 * Theme Colors Utility
 *
 * This utility file provides functions to access theme color variables
 * defined in themeColors.css
 */

/**
 * Gets a CSS variable value
 * 
 * @param {string} variableName - The CSS variable name without the '--' prefix
 * @returns {string} The CSS variable value
 */
export const getCssVar = (variableName) => {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${variableName}`);
};

/**
 * Apply dark theme class to the document element
 */
export const applyThemeClass = () => {
  document.documentElement.classList.add('dark-theme');
};

/**
 * Get Monaco Editor theme configuration
 * 
 * @returns {Object} Monaco editor theme configuration
 */
export const getMonacoTheme = () => {
  return {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: getCssVar('editor-comment').trim(), fontStyle: 'italic' },
      { token: 'keyword', foreground: getCssVar('editor-keyword').trim(), fontStyle: 'bold' },
      { token: 'string', foreground: getCssVar('editor-string').trim() },
      { token: 'number', foreground: getCssVar('editor-number').trim() },
      { token: 'type', foreground: getCssVar('editor-type').trim() },
      { token: 'class', foreground: getCssVar('editor-type').trim(), fontStyle: 'bold' },
      { token: 'function', foreground: getCssVar('editor-function').trim(), fontStyle: 'bold' },
      { token: 'variable', foreground: getCssVar('editor-variable').trim() },
      { token: 'operator', foreground: getCssVar('editor-operator').trim() }
    ],
    colors: {
      'editor.background': getCssVar('bg-editor').trim(),
      'editor.foreground': getCssVar('text-primary').trim(),
      'editor.lineHighlightBackground': getCssVar('editor-lineHighlight').trim(),
      'editorCursor.foreground': getCssVar('text-primary').trim(),
      'editor.selectionBackground': getCssVar('editor-selection').trim(),
      'editor.inactiveSelectionBackground': '#264f7855',
      'editorLineNumber.foreground': getCssVar('text-secondary').trim(),
      'editorLineNumber.activeForeground': getCssVar('text-primary').trim(),
      'editorIndentGuide.background': getCssVar('border-light').trim(),
      'editorIndentGuide.activeBackground': getCssVar('border-main').trim(),
      'editorGutter.background': getCssVar('bg-editor').trim()
    }
  };
};

/**
 * Get XTerm theme configuration
 * 
 * @returns {Object} XTerm theme configuration
 */
export const getTerminalTheme = () => {
  return {
    background: getCssVar('bg-terminal').trim(),
    foreground: getCssVar('text-primary').trim(),
    black: getCssVar('terminal-black').trim(),
    brightBlack: getCssVar('terminal-bright-black').trim(),
    red: getCssVar('terminal-red').trim(),
    brightRed: getCssVar('terminal-bright-red').trim(),
    green: getCssVar('terminal-green').trim(),
    brightGreen: getCssVar('terminal-bright-green').trim(),
    yellow: getCssVar('terminal-yellow').trim(),
    brightYellow: getCssVar('terminal-bright-yellow').trim(),
    blue: getCssVar('terminal-blue').trim(),
    brightBlue: getCssVar('terminal-bright-blue').trim(),
    magenta: getCssVar('terminal-magenta').trim(),
    brightMagenta: getCssVar('terminal-bright-magenta').trim(),
    cyan: getCssVar('terminal-cyan').trim(),
    brightCyan: getCssVar('terminal-bright-cyan').trim(),
    white: getCssVar('terminal-white').trim(),
    brightWhite: getCssVar('terminal-bright-white').trim(),
    selection: getCssVar('terminal-selection').trim()
  };
};
