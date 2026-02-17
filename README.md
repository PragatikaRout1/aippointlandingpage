# aippoint-ai-interview

AI Interview application with backend API - ready for Vercel deployment

## 📁 Structure

```
├── ai-interview.html       # Main interview interface
├── server.js               # Express server
├── local-server.js         # Local development
├── package.json            # Dependencies
├── vercel.json             # Vercel configuration
├── .env.example            # Environment variables
├── api/                    # API routes
│   ├── health.js
│   ├── interview-attempts.js
│   ├── interview-feedback.js
│   ├── send-confirmation.js
│   └── send-feedback.js
├── lib/                    # MongoDB helpers
│   ├── mongodb.js
│   └── schemas.js
├── script.js               # Interview logic
├── styles.css              # Interview styles
├── components.js           # UI components
├── img/                    # Images and assets
└── js/                     # Additional JavaScript
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and other secrets
   ```

3. **Run locally:**
   ```bash
   npm start
   # or
   node local-server.js
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

## 🔗 API Endpoints

- `POST /api/interview-attempts` - Track interview attempts
- `POST /api/interview-feedback` - Save feedback
- `POST /api/send-feedback` - Send feedback emails
- `POST /api/send-contact-email` - Contact form submissions
- `GET /api/health` - Health check

## 🎯 Features

- ✅ AI-powered interviews with real-time feedback
- ✅ Video/audio recording and analysis
- ✅ Attempt limiting (max 4 per email)
- ✅ MongoDB data persistence
- ✅ Email notifications via Resend
- ✅ CORS enabled for external domains
- ✅ Mobile-responsive design
- ✅ Production-ready deployment

## 🛠️ Technologies

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (MongoDB Atlas)
- **Media:** WebRTC for video/audio recording
- **Email:** Resend API
- **Deployment:** Vercel (serverless)

## 📦 Environment Variables

Create `.env` file with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aippoint_interviews
NODE_ENV=production
MAX_ATTEMPTS=4
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=hr@aippoint.ai
REPLY_TO_EMAIL=hr@aippoint.ai
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment
```bash
npm install --production
vercel --prod
```

## 📊 CORS Configuration

Update CORS origins in `server.js` for your marketing site:

```javascript
app.use(cors({
    origin: ['https://your-marketing-site.com', 'http://localhost:3000'],
    credentials: true
}));
```

## 🔧 Development

- Run `npm start` for production server
- Run `node local-server.js` for development with hot reload
- Visit `http://localhost:3000` to test the application

## 📝 License

ISC
