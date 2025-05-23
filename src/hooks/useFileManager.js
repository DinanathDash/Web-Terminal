import { useState } from 'react';

// Initial file structure with basic example
const initialFiles = {
  'example.js': {
    type: 'file',
    content: '// JavaScript Example\nconsole.log("Hello, World!");'
  }
};

const useFileManager = () => {
  // State for tracking files, open files, and the current file
  const [files, setFiles] = useState(initialFiles);
  const [openFiles, setOpenFiles] = useState(['/example.js']);
  const [currentFile, setCurrentFile] = useState('/example.js');
  const [fileContents, setFileContents] = useState({
    '/example.js': initialFiles['example.js'].content,
  });

  // Get file content (load from the state or from the file structure)
  const getFileContent = (path) => {
    if (fileContents[path]) return fileContents[path];

    // Parse path to find content in the files structure
    const segments = path.split('/').filter(s => s);
    let content = files;
    
    for (const segment of segments) {
      if (content[segment] === undefined) return '';
      content = content[segment];
    }

    // Save content to state for future access
    setFileContents(prev => ({
      ...prev,
      [path]: content.content,
    }));
    
    return content.content;
  };

  // Update file content
  const updateFileContent = (path, content) => {
    setFileContents(prev => ({
      ...prev,
      [path]: content,
    }));
  };

  // Open a file
  const openFile = (path) => {
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path]);
    }
    setCurrentFile(path);
    // Ensure we have the content
    if (!fileContents[path]) {
      const content = getFileContent(path);
      if (content) {
        setFileContents(prev => ({
          ...prev,
          [path]: content,
        }));
      }
    }
  };

  // Close a file
  const closeFile = (path) => {
    const newOpenFiles = openFiles.filter(f => f !== path);
    setOpenFiles(newOpenFiles);
    
    // If we closed the current file, switch to another one
    if (currentFile === path && newOpenFiles.length > 0) {
      setCurrentFile(newOpenFiles[newOpenFiles.length - 1]);
    } else if (newOpenFiles.length === 0) {
      setCurrentFile(null);
    }
  };

  // Create a new file
  const createFile = (name, parentPath = '/') => {
    const path = `${parentPath === '/' ? '' : parentPath}/${name}`;
    
    // Update files structure
    const addFileToPath = (obj, segments, fileName, idx = 0) => {
      if (idx === segments.length) {
        // We're at the right level, add the file
        return {
          ...obj,
          [fileName]: { type: 'file', content: '' },
        };
      }
      
      const segment = segments[idx];
      if (!segment) {
        // Handle root path
        return addFileToPath(obj, segments, fileName, idx + 1);
      }
      
      return {
        ...obj,
        [segment]: addFileToPath(obj[segment] || {}, segments, fileName, idx + 1),
      };
    };
    
    const segments = parentPath.split('/').filter(s => s);
    const fileName = name;
    const newFiles = addFileToPath(files, segments, fileName);
    
    setFiles(newFiles);
    
    // Update content state
    setFileContents(prev => ({
      ...prev,
      [path]: '',
    }));
    
    // Open the new file
    openFile(path);
    
    return path;
  };

  // Create a new folder
  const createFolder = (name, parentPath = '/') => {
    // Update files structure
    const addFolderToPath = (obj, segments, folderName, idx = 0) => {
      if (idx === segments.length) {
        // We're at the right level, add the folder
        return {
          ...obj,
          [folderName]: { type: 'folder', content: {} },
        };
      }
      
      const segment = segments[idx];
      if (!segment) {
        // Handle root path
        return addFolderToPath(obj, segments, folderName, idx + 1);
      }
      
      return {
        ...obj,
        [segment]: addFolderToPath(obj[segment] || {}, segments, folderName, idx + 1),
      };
    };
    
    const segments = parentPath.split('/').filter(s => s);
    const folderName = name;
    const newFiles = addFolderToPath(files, segments, folderName);
    
    setFiles(newFiles);
    
    return `${parentPath === '/' ? '' : parentPath}/${name}`;
  };

  return {
    files,
    openFiles,
    currentFile,
    getFileContent,
    updateFileContent,
    openFile,
    closeFile,
    createFile,
    createFolder,
  };
};

export default useFileManager;
