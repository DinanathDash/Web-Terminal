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
  if (res.socket.server.io) {
    // If socket.io was already initialized
    res.end();
    return;
  }

  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: ['https://webexec.vercel.app', 'http://localhost:5173'], 
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io'
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
        // Create a temp file for the code
        const filename = `code_${Date.now()}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
        const filepath = path.join(TEMP_DIR, filename);
        
        // Write code to file
        fs.writeFileSync(filepath, code);
        
        // Execute based on language
        let output = '';
        
        if (language === 'javascript') {
          const result = await execPromise(`node ${filepath}`, { timeout: 10000 });
          output = result.stdout + (result.stderr ? `\nError: ${result.stderr}` : '');
        } else if (language === 'python') {
          const result = await execPromise(`python ${filepath}`, { timeout: 10000 });
          output = result.stdout + (result.stderr ? `\nError: ${result.stderr}` : '');
        } else {
          output = 'Language not supported in serverless environment';
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
    });
  });

  // Make the socket.io instance available
  res.socket.server.io = io;
  
  // Handle the request
  res.end();
};

export default ioHandler;
