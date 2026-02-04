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
        const { db } = await connectToDatabase();
        
        // Test database operations
        const attemptsCollection = db.collection(COLLECTIONS.ATTEMPTS);
        const feedbackCollection = db.collection(COLLECTIONS.FEEDBACK);
        
        // Get collection stats
        const attemptsCount = await attemptsCollection.countDocuments();
        const feedbackCount = await feedbackCollection.countDocuments();
        
        // Test write operation (optional - can be disabled for production)
        const testResult = await attemptsCollection.findOne({ email: '__health_check__' });
        
        const responseTime = Date.now() - startTime;
        
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
            database: {
                status: 'connected',
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
