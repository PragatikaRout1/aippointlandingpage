# MongoDB-Based AI Interview Platform - Vercel Deployment

This document explains the MongoDB-based backend architecture that replaces file-based storage for production deployment on Vercel.

## 🚀 Overview

The AI Interview Platform has been converted from file-based storage to MongoDB for production-ready persistence on Vercel serverless functions.

## 📁 Architecture

### Backend Components

1. **MongoDB Connection** (`lib/mongodb.js`)
   - Connection pooling for serverless environments
   - Automatic connection caching
   - Graceful error handling

2. **Data Schemas** (`lib/schemas.js`)
   - Interview attempts tracking
   - Interview feedback storage
   - Database indexes for performance

3. **API Routes** (`api/`)
   - `interview-attempts.js` - Attempt limit management
   - `interview-feedback.js` - Feedback storage and retrieval
   - `send-feedback.js` - Email delivery to candidates
   - `send-confirmation.js` - Interview confirmation emails
   - `health.js` - System health monitoring

## 🗄️ Database Schema

### Interview Attempts Collection
```javascript
{
  email: "user@example.com",
  count: 2,
  attempts: [
    {
      timestamp: "2024-01-15T10:30:00Z",
      attemptNumber: 1,
      duration: 45,
      completed: true
    }
  ],
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T11:00:00Z"
}
```

### Interview Feedback Collection
```javascript
{
  id: "feedback_1642248000000_abc123def",
  email: "user@example.com",
  candidateName: "John Doe",
  role: "Software Engineer",
  company: "Tech Corp",
  phone: "+1234567890",
  duration: 45,
  questions: [
    {
      question: "Tell me about yourself",
      answer: "I am a software engineer..."
    }
  ],
  scores: {
    communication: 85,
    technical: 80,
    confidence: 90,
    overall: 85
  },
  submittedAt: "2024-01-15T10:45:00Z",
  serverTimestamp: "2024-01-15T10:45:00Z",
  status: "pending",
  reviewerNotes: null
}
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aippoint_interviews?retryWrites=true&w=majority
MONGODB_DB=aippoint_interviews

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@aippoint.ai
REPLY_TO_EMAIL=support@aippoint.ai

# Application
NODE_ENV=production
MAX_ATTEMPTS=3
```

### Vercel Environment Variables

Set these in your Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add the same variables as above
3. Redeploy to apply changes

## 📦 Dependencies

Updated `package.json` includes:

```json
{
  "dependencies": {
    "cors": "^2.8.6",
    "express": "^4.22.1",
    "mongodb": "^6.3.0",
    "mongoose": "^8.0.3"
  }
}
```

## 🚀 Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster (M0+ recommended for production)
3. Create a database user with read/write permissions
4. Whitelist your Vercel deployment IP (0.0.0.0/0 for all IPs)
5. Get your connection string

### 3. Configure Email Service

1. Create a Resend account
2. Verify your domain
3. Get your API key
4. Set up sender email

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📊 API Endpoints

### Interview Attempts
- **POST** `/api/interview-attempts`
  - Check remaining attempts: `{ email, action: "check" }`
  - Increment attempt count: `{ email, action: "increment" }`

### Interview Feedback
- **POST** `/api/interview-feedback` - Save interview feedback
- **GET** `/api/interview-feedback` - Fetch feedback (admin)

### Email Services
- **POST** `/api/send-feedback` - Send feedback email to candidate
- **POST** `/api/send-confirmation` - Send interview confirmation

### Health Check
- **GET** `/api/health` - System health and database status

## 🔒 Security Features

1. **Input Validation** - All inputs are validated and sanitized
2. **Rate Limiting** - Built into Vercel's platform
3. **CORS Protection** - Configured for production domains
4. **Environment Variables** - Sensitive data never exposed
5. **MongoDB Security** - Network access controlled via Atlas

## 📈 Performance Optimizations

1. **Connection Pooling** - Reuses MongoDB connections
2. **Database Indexes** - Optimized for common queries
3. **Serverless Caching** - Connections cached between invocations
4. **Lazy Loading** - Database connects only when needed

## 🛠️ Development

### Local Development
```bash
# Start local server (if needed)
npm run dev

# Or use Vercel dev
vercel dev
```

### Database Seeding
```javascript
// Optional: Seed initial data
const { connectToDatabase, COLLECTIONS } = require('./lib/mongodb');

async function seedData() {
  const { db } = await connectToDatabase();
  // Add seed data here
}
```

## 🔍 Monitoring

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "uptime": 3600,
  "responseTime": "45ms",
  "database": {
    "status": "connected",
    "collections": {
      "attempts": { "count": 150, "status": "active" },
      "feedback": { "count": 89, "status": "active" }
    }
  },
  "system": {
    "memory": { "used": "45MB", "total": "512MB" },
    "platform": "linux",
    "nodeVersion": "18.17.0"
  }
}
```

## 🚨 Error Handling

All API endpoints include comprehensive error handling:

- Database connection errors
- Validation errors
- Network timeouts
- Graceful degradation for development

## 📝 Migration from File-Based Storage

If migrating from the previous file-based system:

1. Export existing JSON data
2. Transform to MongoDB schema format
3. Import using MongoDB tools
4. Update environment variables
5. Deploy new version

## 🤝 Support

For issues with:

- **MongoDB**: Check Atlas dashboard and network access
- **Email**: Verify Resend API key and domain configuration
- **Vercel**: Check function logs and environment variables
- **API**: Use `/api/health` endpoint for diagnostics

## 🔄 Backup Strategy

MongoDB Atlas provides:
- Automated daily backups
- Point-in-time recovery
- Cross-region replication
- Backup retention policies

Configure in your Atlas dashboard under "Backup" section.
