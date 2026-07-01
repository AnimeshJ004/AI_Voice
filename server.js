// ─── AI Voice Agent — Server Entry Point ─────────────────────────────────────
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const callRoutes = require('./routes/call');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Required for Twilio webhooks

// ─── Request Logger — so we can see Twilio POSTs in Vercel logs ──────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'public'))); // Dashboard + audio files

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/call', callRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint — lets you verify everything works from a browser
app.get('/debug', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing',
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Missing',
      GROQ_API_KEY: process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing',
      GROQ_MODEL: process.env.GROQ_MODEL || '(not set, will use default)',
      BASE_URL: process.env.BASE_URL || '❌ Missing',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '⏭️ Skipped (optional)',
      VERCEL: process.env.VERCEL ? 'true' : 'false',
    },
    routes: [
      'POST /call/voice - Twilio incoming call webhook',
      'POST /call/language - Language selection',
      'POST /call/listen - Gather speech',
      'POST /call/respond - AI response',
      'POST /call/status - Call status webhook',
    ],
  });
});

// ─── Global Error Handler — catch any unhandled errors ───────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message, err.stack);
  // Always return valid TwiML on error so Twilio doesn't say "Application Error"
  if (req.url.startsWith('/call')) {
    const twilio = require('twilio');
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Sorry, something went wrong. Please try again later.');
    twiml.hangup();
    res.type('text/xml');
    return res.status(200).send(twiml.toString());
  }
  res.status(500).json({ error: err.message });
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log('ℹ️  Running without database (no MONGODB_URI set). This is fine — calls will still work.');
    return;
  }
  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
}

// ─── Start Server ─────────────────────────────────────────────────────────────
async function start() {
  connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║        🤖  AI Voice Agent  Started!          ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Local:    http://localhost:${PORT}             ║`);
    console.log(`║  Dashboard: http://localhost:${PORT}            ║`);
    console.log('║                                              ║');
    console.log('║  Next: Run ngrok to get public URL          ║');
    console.log('║  > npx ngrok http 3000                      ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    if (!process.env.BASE_URL || process.env.BASE_URL.includes('your-ngrok-url')) {
      console.warn('⚠️  BASE_URL not set in .env — set it to your ngrok URL!');
    }
    if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.includes('xxx')) {
      console.warn('⚠️  TWILIO credentials not configured in .env');
    }
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('xxx')) {
      console.warn('⚠️  GROQ_API_KEY not configured — get a free key at console.groq.com');
    } else {
      console.log('✅ Groq AI ready');
    }
  });
}

// Vercel serverless functions require the app to be exported.
if (process.env.VERCEL) {
  connectDB();
  module.exports = app;
} else {
  start();
  module.exports = app;
}
