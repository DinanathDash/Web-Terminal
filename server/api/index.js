import express from 'express';
import cors from 'cors';

// Create Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handler for Vercel
export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ status: 'Web Terminal API is running' });
  }
  
  // Handle POST requests
  if (req.method === 'POST') {
    // You can add more API endpoints here
    return res.status(405).json({ error: 'Method not supported' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
