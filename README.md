# Aria — AI Voice Agent 🤖🎙️

Aria is an interactive, bilingual (English & Hindi) AI voice assistant built using **Node.js, Express, Groq (LLaMA 3.1), and Twilio**. She can receive incoming phone calls, engage in natural conversation, and allow direct calls from your browser.

---

## Features 🚀

- **Direct Phone Calling:** Call a real Twilio phone number and talk to Aria.
- **Browser Client calling:** Call Aria directly from the web browser dashboard using the Twilio Voice SDK (Web client).
- **Bilingual Conversations:** Select English or Hindi during the call, and Aria will respond natively.
- **Ultra-Fast LLM Processing:** Powered by **Groq LLaMA-3.1-8b-instant** for low-latency conversational responses.
- **Natural-Sounding Voice:** Leverages Twilio's high-quality Amazon Polly voices (`Polly.Aditi` for Hindi and `Polly.Joanna` for English).
- **Graceful DB Fallback:** Integrates with MongoDB to store call transcripts and recordings, but runs perfectly in memory if no database is connected.

---

## Architecture 🛠️

```
.
├── models/             # Mongoose schemas (Call logs)
├── public/             # Static files (Dashboard interface, styles, client JS)
├── routes/             # API routes and Twilio Webhooks
│   ├── api.js          # Client access token gen & stats endpoints
│   └── call.js         # Twilio webhook endpoints (/voice, /listen, /respond)
├── services/           # External integrations (AI logic)
├── server.js           # Express app setup and server listener
└── .env                # Private config keys (ignored by git)
```

---

## Installation & Setup ⚙️

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [ngrok](https://ngrok.com/) (to expose localhost to Twilio webhooks)
- A [Twilio](https://www.twilio.com/) Account (with a Twilio Phone Number and TwiML App SID)
- A free [Groq API Key](https://console.groq.com/)

### 2. Clone and Install Dependencies
```bash
cd "AI-voice"
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (you can copy [.env.example](file:///.env.example)):

```ini
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_TWIML_APP_SID=your_twiml_app_sid
TWILIO_API_KEY=your_api_key
TWILIO_API_SECRET=your_api_secret

# Groq Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant

# Public URL (Updated after running ngrok)
BASE_URL=https://your-ngrok-subdomain.ngrok-free.dev

# Agent Customization
AGENT_NAME=Aria
AGENT_SYSTEM_PROMPT=You are Aria, a friendly and helpful AI voice assistant. Keep your responses concise and conversational.
```

---

## How to Run Locally 🏃‍♂️

### 1. Start the Dev Server
```bash
npm run dev
```
The server will start running at `http://localhost:3000`.

### 2. Start the ngrok Tunnel
In a new terminal window, expose port `3000`:
```bash
npx ngrok http 3000
```
Copy the forwarding `https` URL (e.g., `https://suffering-suffix-squire.ngrok-free.dev`). 

### 3. Update Webhook URLs
- **Twilio Phone Number:** Set your incoming Voice Webhook URL to:
  `https://your-ngrok-subdomain.ngrok-free.dev/call/voice`
- **TwiML App:** Set the Voice Request URL in your TwiML App configuration to:
  `https://your-ngrok-subdomain.ngrok-free.dev/call/voice`
- **`.env` Config:** Set your `BASE_URL` in `.env` to your ngrok URL.

---

## How to Test 🎧

### Option A: Phone Call
Dial your Twilio phone number. Press any key if you hear a trial account warning, then select your language and speak to Aria!

### Option B: Browser Call
Open `http://localhost:3000` in your browser. Click **Start Call**, allow microphone permissions, and start talking directly from your computer!
