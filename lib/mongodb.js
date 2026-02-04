// MongoDB connection utility for Vercel serverless functions
// Includes connection caching and collection definitions

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Check if MongoDB URI is configured
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'aippoint_interviews';

if (!MONGODB_URI) {
    console.warn('[MONGODB] MongoDB URI not configured. Please add MONGODB_URI to your environment variables.');
    console.warn('[MONGODB] Running in mock mode - data will not persist.');
}

// Connection caching for serverless environment
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
    // If no MongoDB URI, return mock database
    if (!MONGODB_URI) {
        console.warn('[MONGODB] Using mock database - no persistence');
        return {
            db: null,
            client: null,
            isMock: true,
            collections: {
                attempts: new Map(),
                feedback: new Map()
            }
        };
    }

    // Return cached connection if available
    if (cachedClient && cachedDb) {
        return { db: cachedDb, client: cachedClient, isMock: false };
    }

    try {
        // Create new MongoDB client
        const client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        // Connect to MongoDB
        await client.connect();
        const db = client.db(MONGODB_DB);

        // Cache the connection
        cachedClient = client;
        cachedDb = db;

        console.log('[MONGODB] Connected successfully to database:', MONGODB_DB);
        return { db, client, isMock: false };

    } catch (error) {
        console.error('[MONGODB] Connection failed:', error.message);
        throw new Error('Failed to connect to database');
    }
}

// Collection names for consistency
export const COLLECTIONS = {
    ATTEMPTS: 'interview_attempts',
    FEEDBACK: 'interview_feedback'
};

// Helper function to handle mock operations
export function handleMockOperation(operation, collection, data = null) {
    console.warn(`[MOCK_DB] ${operation} on ${collection}`);
    
    if (operation === 'find') {
        return [];
    }
    if (operation === 'insert') {
        return { insertedId: `mock_${Date.now()}` };
    }
    if (operation === 'update') {
        return { modifiedCount: 1 };
    }
    if (operation === 'count') {
        return 0;
    }
    
    return null;
}

// Graceful cleanup for serverless environments
export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
