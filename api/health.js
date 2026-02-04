// Health check endpoint for MongoDB-based API
// Monitors database connection and system status

import { connectToDatabase, COLLECTIONS } from '../lib/mongodb.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const startTime = Date.now();
        
        // Test database connection
        const connection = await connectToDatabase();
        const { db, isMock, collections } = connection;
        
        let attemptsCount = 0;
        let feedbackCount = 0;
        let dbStatus = 'connected';
        
        if (isMock) {
            // Mock database - get counts from maps
            attemptsCount = collections.attempts.size;
            feedbackCount = collections.feedback.size;
            dbStatus = 'mock_mode';
        } else {
            // Real MongoDB - get collection stats
            const attemptsCollection = db.collection(COLLECTIONS.ATTEMPTS);
            const feedbackCollection = db.collection(COLLECTIONS.FEEDBACK);
            
            attemptsCount = await attemptsCollection.countDocuments();
            feedbackCount = await feedbackCollection.countDocuments();
        }
        
        const responseTime = Date.now() - startTime;
        
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
            database: {
                status: dbStatus,
                collections: {
                    attempts: {
                        count: attemptsCount,
                        status: 'active'
                    },
                    feedback: {
                        count: feedbackCount,
                        status: 'active'
                    }
                }
            },
            system: {
                memory: process.memoryUsage(),
                platform: process.platform,
                nodeVersion: process.version,
                environment: process.env.NODE_ENV || 'development'
            },
            endpoints: {
                attempts: '/api/interview-attempts',
                feedback: '/api/interview-feedback',
                health: '/api/health'
            }
        };

        console.log('[HEALTH_CHECK]', {
            status: healthStatus.status,
            responseTime: `${responseTime}ms`,
            databaseConnections: {
                attempts: attemptsCount,
                feedback: feedbackCount
            }
        });

        return res.status(200).json(healthStatus);

    } catch (error) {
        console.error('[HEALTH_CHECK_ERROR]', error);
        
        return res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
            details: error.message,
            uptime: process.uptime()
        });
    }
}
