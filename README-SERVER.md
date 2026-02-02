# Interview API Server Setup

This server provides API endpoints for interview attempt tracking and email confirmation.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Access Your Application

Open `ai-interview.html` in your browser. The API endpoints will be available at:
- `http://localhost:3000/api/interview-attempts/check`
- `http://localhost:3000/api/send-confirmation`

## API Endpoints

### POST `/api/interview-attempts/check`

Check or increment interview attempts for an email address.

**Request Body:**
```json
{
  "email": "user@example.com",
  "action": "check" // or "increment"
}
```

**Response (check):**
```json
{
  "canStart": true,
  "attempts": 1,
  "maxAttempts": 3,
  "message": null
}
```

**Response (increment):**
```json
{
  "success": true,
  "attempts": 2,
  "maxAttempts": 3
}
```

### POST `/api/send-confirmation`

Send confirmation email after successful interview submission.

**Request Body:**
```json
{
  "email": "user@example.com",
  "candidateName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Confirmation email sent"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Email Configuration (Optional)

To enable real email sending, set environment variables:

### Using Resend (Recommended)

1. Sign up at https://resend.com
2. Get your API key
3. Set environment variables:

**Windows (PowerShell):**
```powershell
$env:RESEND_API_KEY="re_your_api_key_here"
$env:FROM_EMAIL="noreply@yourdomain.com"
npm start
```

**Windows (CMD):**
```cmd
set RESEND_API_KEY=re_your_api_key_here
set FROM_EMAIL=noreply@yourdomain.com
npm start
```

**Mac/Linux:**
```bash
export RESEND_API_KEY="re_your_api_key_here"
export FROM_EMAIL="noreply@yourdomain.com"
npm start
```

### Without Email Service

If no email API key is configured, the server will:
- Log email details to console
- Still return success (won't fail interview submission)
- Allow interviews to complete normally

## Storage

Interview attempts are stored in `interview-attempts.json` in the project root. This file is automatically created and updated.

**Note:** For production, consider using a database (MongoDB, PostgreSQL, etc.) instead of file storage.

## Production Deployment

### Option 1: Deploy to Heroku

1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: node server.js
   ```
3. Deploy:
   ```bash
   heroku create your-app-name
   git push heroku main
   heroku config:set RESEND_API_KEY=your_key
   ```

### Option 2: Deploy to Railway

1. Connect your GitHub repo
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Option 3: Deploy to Vercel/Netlify

Convert the Express routes to serverless functions (see `api/` folder for examples).

## Troubleshooting

### Port Already in Use

Change the port:
```bash
PORT=3001 npm start
```

### CORS Errors

The server includes CORS middleware. If you still see errors, check:
- Server is running
- Correct port number
- Browser console for specific errors

### Email Not Sending

1. Check if `RESEND_API_KEY` is set
2. Verify API key is valid
3. Check server logs for errors
4. Email will still log to console even if sending fails

## Development

The server automatically:
- Loads existing attempts on startup
- Saves attempts after each increment
- Handles errors gracefully
- Works without email service (log-only mode)

