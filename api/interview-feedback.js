// MongoDB-based interview feedback storage for Vercel serverless functions
// Handles saving and retrieving interview feedback with persistent storage

import { connectToDatabase, COLLECTIONS } from '../lib/mongodb.js';

// Utility functions
function normalizeEmail(email) {
    return email ? email.toLowerCase().trim() : '';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateFeedbackId() {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { db } = await connectToDatabase();
        const feedbackCollection = db.collection(COLLECTIONS.FEEDBACK);

        if (req.method === 'POST') {
            // Save new feedback
            const {
                email,
                candidateName,
                role,
                company,
                phone,
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
                id: generateFeedbackId(),
                email: normalizeEmail(email),
                candidateName: candidateName.trim(),
                role: role.trim(),
                company: company ? company.trim() : null,
                phone: phone ? phone.trim() : null,
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
                serverTimestamp: new Date(),
                status: 'pending',
                reviewerNotes: null
            };

            // Insert into MongoDB
            await feedbackCollection.insertOne(feedbackEntry);

            console.log(`[FEEDBACK_SAVED] ${normalizeEmail(email)}`, {
                candidateName,
                role,
                overallScore: scores.overall,
                feedbackId: feedbackEntry.id
            });

            return res.json({
                success: true,
                id: feedbackEntry.id,
                message: 'Feedback saved successfully'
            });

        } else if (req.method === 'GET') {
            // Fetch feedback (admin endpoint)
            const { email, status, limit = 50, offset = 0 } = req.query;

            let query = {};
            
            // Build query based on parameters
            if (email) {
                query.email = normalizeEmail(email);
            }
            
            if (status) {
                query.status = status;
            }

            // Fetch feedback with pagination
            const feedback = await feedbackCollection
                .find(query)
                .sort({ submittedAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(offset))
                .toArray();

            const totalCount = await feedbackCollection.countDocuments(query);

            console.log(`[FEEDBACK_FETCHED]`, {
                query,
                count: feedback.length,
                totalCount
            });

            return res.json({
                success: true,
                count: feedback.length,
                totalCount,
                data: feedback,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: offset + feedback.length < totalCount
                }
            });

        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error('[FEEDBACK_ERROR]', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
