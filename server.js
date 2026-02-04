// Express server for AI Interview platform
// Production-ready Node.js + Express server
// Run with: node server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from root directory

// Storage file paths
const ATTEMPTS_FILE = path.join(__dirname, 'interview-attempts.json');
const FEEDBACK_FILE = path.join(__dirname, 'interview-feedback.json');

// In-memory stores (loaded from files)
let attemptsStore = new Map();
let feedbackStore = [];

// Configuration
const MAX_ATTEMPTS = 4;

// Utility functions
function normalizeEmail(email) {
    return email ? email.toLowerCase().trim() : '';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function logAttempt(action, email, details = {}) {
    console.log(`[${new Date().toISOString()}] ${action.toUpperCase()}: ${email}`, details);
}

// Load data from files on startup
async function loadAttempts() {
    try {
        const data = await fs.readFile(ATTEMPTS_FILE, 'utf8');
        const parsed = JSON.parse(data);
        attemptsStore = new Map(Object.entries(parsed));
        console.log(`✅ Loaded interview attempts from ${ATTEMPTS_FILE}`);
        console.log(`📊 Active users: ${attemptsStore.size}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`ℹ️  No existing attempts file, starting fresh`);
            attemptsStore = new Map();
        } else {
            console.error(`❌ Error loading attempts file:`, error);
            attemptsStore = new Map();
        }
    }
}

async function loadFeedback() {
    try {
        const data = await fs.readFile(FEEDBACK_FILE, 'utf8');
        feedbackStore = JSON.parse(data);
        console.log(`✅ Loaded interview feedback from ${FEEDBACK_FILE}`);
        console.log(`📝 Total feedback entries: ${feedbackStore.length}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`ℹ️  No existing feedback file, starting fresh`);
            feedbackStore = [];
        } else {
            console.error(`❌ Error loading feedback file:`, error);
            feedbackStore = [];
        }
    }
}

// Save data to files
async function saveAttempts() {
    try {
        const data = Object.fromEntries(attemptsStore);
        await fs.writeFile(ATTEMPTS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`❌ Error saving attempts file:`, error);
    }
}

async function saveFeedback() {
    try {
        await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedbackStore, null, 2));
    } catch (error) {
        console.error(`❌ Error saving feedback file:`, error);
    }
}

// ==========================================================
// FEATURE 1: INTERVIEW ATTEMPT LIMIT (CRITICAL)
// ==========================================================
app.post('/api/interview-attempts/check', async (req, res) => {
    try {
        const { email, action } = req.body;

        // Validate input
        if (!email || !action) {
            return res.status(400).json({
                error: 'Email and action are required'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        if (!['check', 'increment'].includes(action)) {
            return res.status(400).json({
                error: 'Action must be "check" or "increment"'
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const existingData = attemptsStore.get(normalizedEmail) || {
            count: 0,
            attempts: []
        };

        const isDisabled = existingData.count >= MAX_ATTEMPTS;

        if (action === 'check') {
            const canStart = existingData.count < MAX_ATTEMPTS;
            
            logAttempt('check', normalizedEmail, {
                currentAttempts: existingData.count,
                canStart,
                disabled: isDisabled
            });

            return res.json({
                canStart,
                attempts: existingData.count,
                maxAttempts: MAX_ATTEMPTS,
                disabled: isDisabled,
                message: isDisabled ? 'Interview limit reached' : null
            });
        }

        if (action === 'increment') {
            if (existingData.count >= MAX_ATTEMPTS) {
                logAttempt('blocked', normalizedEmail, {
                    currentAttempts: existingData.count,
                    reason: 'Limit reached'
                });

                return res.status(403).json({
                    error: 'Interview limit reached',
                    attempts: existingData.count,
                    maxAttempts: MAX_ATTEMPTS,
                    disabled: true
                });
            }

            // Increment attempt
            existingData.count += 1;
            const newAttempt = {
                email: normalizedEmail,
                timestamp: new Date().toISOString(),
                attemptNumber: existingData.count
            };

            existingData.attempts.push(newAttempt);
            attemptsStore.set(normalizedEmail, existingData);

            // Persist immediately
            await saveAttempts();

            logAttempt('increment', normalizedEmail, {
                newCount: existingData.count,
                attemptNumber: newAttempt.attemptNumber
            });

            const isNowDisabled = existingData.count >= MAX_ATTEMPTS;

            return res.json({
                success: true,
                attempts: existingData.count,
                maxAttempts: MAX_ATTEMPTS,
                disabled: isNowDisabled,
                attemptNumber: newAttempt.attemptNumber,
                timestamp: newAttempt.timestamp
            });
        }

    } catch (error) {
        console.error(`❌ Error in interview attempts check:`, error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// ==========================================================
// FEATURE 3: INTERVIEW FEEDBACK API (NO EMAIL)
// ==========================================================
app.post('/api/interview-feedback', async (req, res) => {
    try {
        const {
            email,
            candidateName,
            role,
            duration,
            questions,
            scores,
            submittedAt
        } = req.body;

        // Validate required fields
        if (!email || !candidateName || !role) {
            return res.status(400).json({
                error: 'Email, candidateName, and role are required'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                error: 'Questions array is required and cannot be empty'
            });
        }

        if (!scores || typeof scores !== 'object') {
            return res.status(400).json({
                error: 'Scores object is required'
            });
        }

        // Create feedback entry
        const feedbackEntry = {
            id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: normalizeEmail(email),
            candidateName,
            role,
            duration: duration || null,
            questions: questions.map(q => ({
                question: q.question || '',
                answer: q.answer || ''
            })),
            scores: {
                communication: scores.communication || 0,
                technical: scores.technical || 0,
                confidence: scores.confidence || 0,
                overall: scores.overall || 0
            },
            submittedAt: submittedAt || new Date().toISOString(),
            serverTimestamp: new Date().toISOString()
        };

        // Add to feedback store
        feedbackStore.push(feedbackEntry);

        // Persist immediately
        await saveFeedback();

        logAttempt('feedback', normalizeEmail(email), {
            candidateName,
            role,
            overallScore: scores.overall
        });

        return res.json({
            success: true,
            id: feedbackEntry.id,
            message: 'Feedback saved successfully'
        });

    } catch (error) {
        console.error(`❌ Error saving interview feedback:`, error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// ==========================================================
// FEATURE 4: FETCH FEEDBACK (OPTIONAL ADMIN)
// ==========================================================
app.get('/api/interview-feedback', (req, res) => {
    try {
        logAttempt('fetch_feedback', 'admin', {
            totalEntries: feedbackStore.length
        });

        return res.json({
            success: true,
            count: feedbackStore.length,
            data: feedbackStore
        });

    } catch (error) {
        console.error(`❌ Error fetching interview feedback:`, error);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// ==========================================================
// FEATURE 5: HEALTH CHECK
// ==========================================================
app.get('/api/health', (req, res) => {
    return res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        stats: {
            activeUsers: attemptsStore.size,
            totalFeedback: feedbackStore.length
        }
    });
});

// ==========================================================
// STARTUP
// ==========================================================
async function startServer() {
    console.log(`🚀 Starting AI Interview Platform Server...`);
    
    // Load persistent data
    await loadAttempts();
    await loadFeedback();
    
    // Start listening
    app.listen(PORT, () => {
        console.log(`\n✅ Server running on http://localhost:${PORT}`);
        console.log(`📁 Serving static files from: ${__dirname}`);
        console.log(`💾 Attempts storage: ${ATTEMPTS_FILE}`);
        console.log(`📝 Feedback storage: ${FEEDBACK_FILE}`);
        console.log(`\n📡 Available endpoints:`);
        console.log(`  POST /api/interview-attempts/check`);
        console.log(`  POST /api/interview-feedback`);
        console.log(`  GET  /api/interview-feedback`);
        console.log(`  GET  /api/health`);
        console.log(`\n⚙️  Configuration:`);
        console.log(`  Max attempts per email: ${MAX_ATTEMPTS}`);
        console.log(`  Email sending: DISABLED`);
        console.log(`  Database: FILE-BASED`);
        console.log(`\n🎯 Server is ready for production!`);
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n🛑 Shutting down gracefully...`);
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log(`\n🛑 Shutting down gracefully...`);
    process.exit(0);
});

// Start the server
startServer().catch(error => {
    console.error(`❌ Failed to start server:`, error);
    process.exit(1);
});
