# Interview Attempt Limit & Email Confirmation - API Setup Guide

## Overview
This implementation adds email-based interview attempt limiting (max 3 attempts) and sends confirmation emails after successful interview submission.

## Backend API Setup

### Option 1: Vercel Serverless Functions (Recommended)

1. **Create API files** (already created):
   - `api/interview-attempts.js` - Handles attempt checking and incrementing
   - `api/send-confirmation.js` - Sends confirmation emails

2. **Install dependencies** (if using Resend for emails):
   ```bash
   npm install resend
   ```

3. **Set environment variables** in Vercel:
   - `RESEND_API_KEY` - Your Resend API key
   - `FROM_EMAIL` - Sender email address (e.g., noreply@aippoint.ai)

4. **Deploy to Vercel**:
   ```bash
   vercel deploy
   ```

### Option 2: Netlify Functions

1. Create `netlify/functions/interview-attempts.js` and `netlify/functions/send-confirmation.js`
2. Copy the code from the `api/` files
3. Set environment variables in Netlify dashboard
4. Deploy

### Option 3: AWS Lambda / Cloud Functions

1. Create Lambda functions with the same code
2. Set up API Gateway endpoints
3. Configure environment variables
4. Update API URLs in `ai-interview.html`

## Database Setup (Production)

The current implementation uses in-memory storage. For production, replace with:

### Option A: Supabase (Recommended for simplicity)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Store attempts
await supabase.from('interview_attempts').upsert({
  email: normalizedEmail,
  count: newCount,
  last_attempt: new Date().toISOString()
});
```

### Option B: Firestore
```javascript
import admin from 'firebase-admin';
const db = admin.firestore();

const docRef = db.collection('interview_attempts').doc(normalizedEmail);
await docRef.set({
  count: newCount,
  lastAttempt: admin.firestore.FieldValue.serverTimestamp()
}, { merge: true });
```

### Option C: Redis (Fast, ephemeral)
```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

await redis.incr(`attempts:${normalizedEmail}`);
await redis.expire(`attempts:${normalizedEmail}`, 86400 * 30); // 30 days
```

## Email Service Setup

### Using Resend (Recommended)
1. Sign up at https://resend.com
2. Get API key
3. Verify sender domain
4. Set `RESEND_API_KEY` environment variable

### Using SendGrid
Replace the fetch call in `send-confirmation.js`:
```javascript
await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email }] }],
    from: { email: FROM_EMAIL },
    subject: 'Your AI Interview Has Been Successfully Submitted',
    content: [{ type: 'text/html', value: emailHtml }]
  })
});
```

### Using AWS SES
Use AWS SDK instead of fetch for SES.

## Frontend Integration

The frontend (`ai-interview.html`) has been updated to:
1. Check attempts before starting interview (line ~1520)
2. Increment attempts when interview starts
3. Send confirmation email on successful submission (line ~1407)

**API Endpoints Used:**
- `POST /api/interview-attempts/check` - Check and increment attempts
- `POST /api/send-confirmation` - Send confirmation email

## Testing

### Local Development
1. Use a local server (e.g., `python -m http.server` or `npx serve`)
2. Mock the API endpoints or use a local serverless function runner
3. Test with different email addresses

### Production Testing
1. Test with a test email address
2. Verify attempt counting works correctly
3. Verify email is sent only on successful submission
4. Test max attempt blocking

## Security Considerations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Email Validation**: Already implemented server-side
3. **CORS**: Configure CORS properly for production
4. **API Keys**: Never expose API keys in frontend code
5. **Input Sanitization**: Email is validated before processing

## Monitoring

Logs are written to console for:
- Interview attempt starts
- Interview submissions
- Email sending status

For production, integrate with logging service (e.g., LogRocket, Sentry).

