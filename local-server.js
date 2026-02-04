// Local development server for testing MongoDB API routes
// This simulates Vercel serverless functions locally

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import API routes
import interviewAttemptsHandler from './api/interview-attempts.js';
import interviewFeedbackHandler from './api/interview-feedback.js';
import sendFeedbackHandler from './api/send-feedback.js';
import sendConfirmationHandler from './api/send-confirmation.js';
import healthHandler from './api/health.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// API Routes - wrap Vercel handlers for Express
app.post('/api/interview-attempts', async (req, res) => {
  try {
    await interviewAttemptsHandler(req, res);
  } catch (error) {
    console.error('[API_ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/interview-feedback', async (req, res) => {
  try {
    await interviewFeedbackHandler(req, res);
  } catch (error) {
    console.error('[API_ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/interview-feedback', async (req, res) => {
  try {
    await interviewFeedbackHandler(req, res);
  } catch (error) {
    console.error('[API_ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/send-feedback', async (req, res) => {
  try {
    await sendFeedbackHandler(req, res);
  } catch (error) {
    console.error('[API_ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/send-confirmation', async (req, res) => {
  try {
    await sendConfirmationHandler(req, res);
  } catch (error) {
    console.error('[API_ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await healthHandler(req, res);
  } catch (error) {
    console.error('[API_ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve the main HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/ai-interview', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai-interview.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at:`);
  console.log(`   POST /api/interview-attempts - Interview attempt management`);
  console.log(`   POST /api/interview-feedback - Save interview feedback`);
  console.log(`   GET  /api/interview-feedback - Fetch interview feedback`);
  console.log(`   POST /api/send-feedback - Send feedback email`);
  console.log(`   POST /api/send-confirmation - Send confirmation email`);
  console.log(`   GET  /api/health - System health check`);
  console.log(`\n🌐 Frontend available at:`);
  console.log(`   http://localhost:${PORT}/ - Main page`);
  console.log(`   http://localhost:${PORT}/ai-interview - AI Interview`);
  console.log(`\n⚠️  Make sure to set up your .env.local file with MongoDB and email credentials`);
});

export default app;
