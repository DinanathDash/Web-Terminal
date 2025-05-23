import { Server } from 'socket.io';
import { createServer } from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Convert exec to Promise-based
const execPromise = promisify(exec);

// Temporary directory for code files - using /tmp for Vercel serverless functions
const TEMP_DIR = '/tmp/web-terminal';

// Ensure the temporary directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Standard library definitions and language configuration can be imported from the main server file
// Here we're only including the essential parts for the socket handler

const clientPreferences = new Map();

// Create an instance of Socket.IO server
const ioHandler = (req, res) => {
  // Return early if socket.io instance already exists
  if (res.socket.server.io) {
    console.log('Socket.IO is already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.IO server...');
  const io = new Server(res.socket.server, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: ['https://webexec.vercel.app', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket.IO logic - simplified for serverless
  io.on('connection', socket => {
    console.log('Client connected:', socket.id);

    const socketState = {
      clientId: socket.handshake.query?.clientId || socket.id,
      userPreferences: {
        theme: 'auto',
        packageManager: 'auto'
      },
      executionHistory: [],
      installedPackages: {}
    };
    
    // Execute code handler
    socket.on('execute', async ({ code, language }) => {
      console.log(`Received code execution request for language: ${language}`);
      
      try {
        // Create a temp directory for this socket
        const userTempDir = path.join(TEMP_DIR, socket.id);
        if (!fs.existsSync(userTempDir)) {
          fs.mkdirSync(userTempDir, { recursive: true });
        }

        // Create a temp file for the code
        const filename = `code_${Date.now()}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
        const filepath = path.join(userTempDir, filename);
        
        // Write code to file
        fs.writeFileSync(filepath, code);
        
        // Execute based on language
        let output = '';
        const execOptions = {
          timeout: 10000, // 10 second timeout
          cwd: path.dirname(filepath), // Run in the temp directory
          env: { ...process.env, NODE_ENV: 'production' }, // Safe environment
          maxBuffer: 1024 * 1024 // 1MB output limit
        };
        
        try {
          if (language === 'javascript') {
            const result = await execPromise(`node ${filepath}`, execOptions);
            output = result.stdout + (result.stderr ? `\nError: ${result.stderr}` : '');
          } else if (language === 'python') {
            const result = await execPromise(`python ${filepath}`, execOptions);
            output = result.stdout + (result.stderr ? `\nError: ${result.stderr}` : '');
          } else {
            output = 'Language not supported in serverless environment';
          }
        } catch (execError) {
          output = `Execution Error: ${execError.message}\n${execError.stderr || ''}`;
          throw new Error(output);
        }
        
        // Send output to client
        socket.emit('output', { output });
        socket.emit('execution-complete');
        
        // Clean up temp file
        fs.unlinkSync(filepath);
        
      } catch (error) {
        console.error('Error during code execution:', error);
        socket.emit('output', {
          output: `\r\n\x1b[31mExecution error: ${error.message}\x1b[0m\r\n`,
          error: true
        });
        socket.emit('execution-complete');
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up any temporary files if they exist
      try {
        const userTempDir = path.join(TEMP_DIR, socket.id);
        if (fs.existsSync(userTempDir)) {
          fs.rmSync(userTempDir, { recursive: true, force: true });
        }
      } catch (error) {
        console.error('Error cleaning up temp files:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Make the socket.io instance available
  res.socket.server.io = io;

  console.log('Socket.IO server initialized successfully');
  res.end();
};

// Export the handler
export default ioHandler;
