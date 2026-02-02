// Serverless function for interview attempt tracking
// Deploy to: Vercel (/api/interview-attempts.js) or Netlify (/netlify/functions/interview-attempts.js)

// For production, replace Map with database (Supabase, Firestore, Redis, etc.)
const attemptsStore = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, action } = req.body;

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get current attempt count
    const currentAttempts = attemptsStore.get(normalizedEmail) || {
      count: 0,
      attempts: []
    };

    if (action === 'check') {
      // Check if user can start interview
      const canStart = currentAttempts.count < 3;
      return res.status(200).json({
        canStart,
        attempts: currentAttempts.count,
        maxAttempts: 3,
        message: canStart 
          ? null 
          : 'You have reached the maximum number of interview attempts for this email address.'
      });
    }

    if (action === 'increment') {
      // Increment attempt count
      const newCount = currentAttempts.count + 1;
      
      if (newCount > 3) {
        return res.status(403).json({
          error: 'Maximum attempts reached',
          attempts: currentAttempts.count,
          maxAttempts: 3
        });
      }

      // Log attempt
      const attemptLog = {
        email: normalizedEmail,
        timestamp: new Date().toISOString(),
        attemptNumber: newCount
      };

      attemptsStore.set(normalizedEmail, {
        count: newCount,
        attempts: [...currentAttempts.attempts, attemptLog]
      });

      // Log server-side for audit
      console.log('[INTERVIEW ATTEMPT]', JSON.stringify({
        email: normalizedEmail,
        attemptCount: newCount,
        timestamp: attemptLog.timestamp,
        status: 'started'
      }));

      return res.status(200).json({
        success: true,
        attempts: newCount,
        maxAttempts: 3
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('[API ERROR]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

