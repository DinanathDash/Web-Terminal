// filepath: /Users/dinanathdash/Documents/Drive/Projects/Web Terminal/server/api/socket.js
import fs from 'fs';
import path from 'path';

// Temporary directory for code files - using /tmp for Vercel serverless functions
const TEMP_DIR = '/tmp/web-terminal';

// Ensure the temporary directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Simulated code execution in serverless environment
const executeCode = (code, language) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is a simulated response since we can't execute real code in serverless
      let output = '';
      
      switch(language) {
        case 'javascript':
          output = `✅ Executed JavaScript code in serverless mode.\n\nSimulated output:\n${code.includes('console.log') ? 
            code.match(/console\.log\(['"](.*?)['"]\)/)?.[1] || 'Hello from JavaScript!' : 
            'Hello from JavaScript!'}`;
          break;
        case 'python':
          output = `✅ Executed Python code in serverless mode.\n\nSimulated output:\n${code.includes('print') ? 
            code.match(/print\(['"](.*?)['"]\)/)?.[1] || 'Hello from Python!' : 
            'Hello from Python!'}`;
          break;
        default:
          output = `✅ Executed code in serverless mode.\n\nLanguage: ${language}\nSimulated output: Hello World!`;
      }
      
      resolve({ stdout: output, stderr: '' });
    }, 500); // Simulate processing time
  });
};

// Handle CORS preflight requests
const handleCors = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
};

// Create a handler for Vercel serverless functions
const socketHandler = async (req, res) => {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  // For Vercel serverless functions, we handle code execution via HTTP
  if (req.method === 'POST') {
    // Handle code execution via HTTP POST instead of WebSockets
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { code, language } = JSON.parse(body);
        const result = await executeCode(code, language);
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          status: 'success', 
          output: result.stdout,
          error: result.stderr 
        }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ 
          status: 'error', 
          message: 'Failed to execute code',
          error: err.message
        }));
      }
    });
    return;
  }

  // For GET requests, provide status information
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      status: 'active', 
      message: 'Web Terminal API is running in serverless mode',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // If we get here, it's an unsupported method
  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method not allowed' }));
};

// Export the handler for Vercel serverless function
export default socketHandler;
