// MongoDB-based interview attempt tracking for Vercel serverless functions
// Replaces file-based storage with MongoDB for production persistence

import { connectToDatabase, COLLECTIONS } from '../lib/mongodb.js';

const MAX_ATTEMPTS = 3;

// Utility functions
function normalizeEmail(email) {
    return email ? email.toLowerCase().trim() : '';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateResponse(statusCode, data) {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };
}

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let client;
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

        // Connect to MongoDB
        const connection = await connectToDatabase();
        const { db, isMock, collections } = connection;
        
        if (isMock) {
            // Handle mock database operations
            const attemptsMap = collections.attempts;
            let userAttempts = attemptsMap.get(normalizedEmail);

            if (!userAttempts) {
                userAttempts = {
                    email: normalizedEmail,
                    count: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                attemptsMap.set(normalizedEmail, userAttempts);
            }

            if (action === 'check') {
                const canStart = userAttempts.count < MAX_ATTEMPTS;
                const disabled = userAttempts.count >= MAX_ATTEMPTS;

                return res.status(200).json({
                    email: normalizedEmail,
                    attempts: userAttempts.count,
                    maxAttempts: MAX_ATTEMPTS,
                    canStart,
                    disabled,
                    remainingAttempts: Math.max(0, MAX_ATTEMPTS - userAttempts.count)
                });
            }

            if (action === 'increment') {
                if (userAttempts.count >= MAX_ATTEMPTS) {
                    return res.status(429).json({
                        error: 'Maximum attempts reached',
                        attempts: userAttempts.count,
                        maxAttempts: MAX_ATTEMPTS,
                        canStart: false,
                        disabled: true
                    });
                }

                userAttempts.count += 1;
                userAttempts.updatedAt = new Date();
                attemptsMap.set(normalizedEmail, userAttempts);

                const canStart = userAttempts.count < MAX_ATTEMPTS;
                const disabled = userAttempts.count >= MAX_ATTEMPTS;

                return res.status(200).json({
                    email: normalizedEmail,
                    attempts: userAttempts.count,
                    maxAttempts: MAX_ATTEMPTS,
                    canStart,
                    disabled,
                    remainingAttempts: Math.max(0, MAX_ATTEMPTS - userAttempts.count),
                    message: 'Attempt incremented successfully (mock mode)'
                });
            }
        }

        // Real MongoDB operations
        client = db.client;

        const attemptsCollection = db.collection(COLLECTIONS.ATTEMPTS);

        // Find or create user attempt record
        let userAttempts = await attemptsCollection.findOne({ email: normalizedEmail });

        if (!userAttempts) {
            // Create new user record
            userAttempts = {
                email: normalizedEmail,
                count: 0,
                attempts: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await attemptsCollection.insertOne(userAttempts);
        }

        const isDisabled = userAttempts.count >= MAX_ATTEMPTS;

        if (action === 'check') {
            const canStart = userAttempts.count < MAX_ATTEMPTS;
            
            console.log(`[ATTEMPT_CHECK] ${normalizedEmail}`, {
                currentAttempts: userAttempts.count,
                canStart,
                disabled: isDisabled
            });

            return res.json({
                canStart,
                attempts: userAttempts.count,
                maxAttempts: MAX_ATTEMPTS,
                disabled: isDisabled,
                message: isDisabled ? 'Interview limit reached' : null
            });
        }

        if (action === 'increment') {
            if (userAttempts.count >= MAX_ATTEMPTS) {
                console.log(`[ATTEMPT_BLOCKED] ${normalizedEmail}`, {
                    currentAttempts: userAttempts.count,
                    reason: 'Limit reached'
                });

                return res.status(403).json({
                    error: 'Interview limit reached',
                    attempts: userAttempts.count,
                    maxAttempts: MAX_ATTEMPTS,
                    disabled: true
                });
            }

            // Increment attempt
            const newCount = userAttempts.count + 1;
            const newAttempt = {
                timestamp: new Date(),
                attemptNumber: newCount,
                completed: false
            };

            // Update user record
            await attemptsCollection.updateOne(
                { email: normalizedEmail },
                {
                    $set: {
                        count: newCount,
                        updatedAt: new Date()
                    },
                    $push: {
                        attempts: newAttempt
                    }
                }
            );

            console.log(`[ATTEMPT_INCREMENT] ${normalizedEmail}`, {
                newCount,
                attemptNumber: newAttempt.attemptNumber
            });

            const isNowDisabled = newCount >= MAX_ATTEMPTS;

            return res.json({
                success: true,
                attempts: newCount,
                maxAttempts: MAX_ATTEMPTS,
                disabled: isNowDisabled,
                attemptNumber: newAttempt.attemptNumber,
                timestamp: newAttempt.timestamp
            });
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error) {
        console.error('[ATTEMPT_ERROR]', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    } finally {
        // Note: In serverless environments, we don't typically close connections
        // as they are reused across invocations. The connection will be cached.
    }
}

