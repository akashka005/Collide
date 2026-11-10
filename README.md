# Collide (STRAVAIR) — Meet Beyond Your Circle 🌌

> **Collide** is a privacy-first, AI-powered random social discovery platform. Meet new people spontaneously through text or WebRTC video chat, match based on shared interests and language preferences, play synchronized interactive games, and form mutual connections — all without exposing your real-world identity.

---

## ⚡ Highlights

- 🔞 **18+ Age Verification Gate**: Strict pre-entry gate with full date of birth verification and client + WebSocket server-side enforcement.
- ⚡ **Lightning Matchmaking**: Real-time matchmaking queue with weighted interest matching, language filters, and queue depth indicators.
- 📹 **Peer-to-Peer Video Chat**: Low-latency, privacy-preserving WebRTC audio/video with STUN/TURN signaling and media controls (mute, camera toggle, flip).
- 💬 **Real-Time Text Chat**: Low-latency WebSocket messaging with live typing indicators, emoji reactions, and skip/rematch controls.
- 🤖 **Groq AI Conversation Copilot**: Powered by Groq (`llama-3.3-70b-versatile`) to generate witty, relevant icebreakers based on shared interests.
- 🎮 **Synchronized In-Chat Mini-Games**:
  - **Tic-Tac-Toe**: Turn-based multiplayer with real-time state sync and win detection.
  - **Trivia Arena**: Timed multiple-choice questions with live partner answers.
  - **Would You Rather**: Synchronized voting prompts to break the ice.
- 🤝 **Mutual Connections**: Connect after a conversation only when both participants mutually consent; stored pseudonymously.
- 🛡️ **Trust & Safety First**: Instant skip, user blocking, report modal with categorization, and moderation dashboard.
- 🎨 **Artisanal Glassmorphism UI**: Built with Tailwind CSS v4, smooth animations, dark/light modes, and completely hidden scrollbars for an immersive full-screen experience.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Protocols**: Native WebSockets, WebRTC API

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Validation & Settings**: [Pydantic v2](https://docs.pydantic.dev/) + `pydantic-settings`
- **Realtime / WebSockets**: FastAPI WebSocket routes with decoupled `ConnectionManager` and `EventRouter`
- **AI Engine**: [Groq Cloud SDK](https://console.groq.com/) (`llama-3.3-70b-versatile`)
- **Database**: SQLite (Async via `aiosqlite`) / PostgreSQL (via `asyncpg`) with SQLAlchemy 2.0
- **Queue & State**: Redis (`redis-py` async) with zero-setup `fakeredis` fallback
- **Testing**: `pytest` + `pytest-asyncio` + `httpx`

---

## 📁 Project Structure

```
Collide/
├── backend/
│   ├── app/
│   │   ├── ai/                # Groq AI Copilot service & prompts
│   │   ├── api/v1/            # REST API endpoints (auth, matches, health, reports, etc.)
│   │   ├── core/              # Config, logging, JWT security
│   │   ├── db/                # SQLAlchemy database session & models
│   │   ├── realtime/          # WebSocket connection manager, event router, games handler
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   └── services/          # Matching service & room state management
│   ├── tests/                 # Comprehensive pytest test suite
│   ├── requirements.txt       # Python backend dependencies
│   └── .env.example           # Backend environment template
├── src/
│   ├── components/            # Reusable UI components (AgeGate, EmojiReaction, etc.)
│   ├── context/               # Global SocialDiscoveryContext (WebSocket state & WebRTC)
│   ├── features/
│   │   ├── auth/              # Guest login, Email signup/login, Google OAuth modals
│   │   ├── chat/              # Active text/video chat view, controls, game panels
│   │   ├── connections/       # Mutual connections drawer & management
│   │   ├── landing/           # Landing page hero, nav, theme toggle, feature strip
│   │   ├── lobby/             # Discovery lobby (mode selection, interest tags, language)
│   │   ├── moderation/        # Moderation overview dashboard
│   │   └── safety/            # Report and blocking dialogs
│   ├── lib/                   # Utility helpers & audio generators
│   ├── App.tsx                # Main view router & modal manager
│   ├── index.css              # Glassmorphic styles & scrollbar suppression
│   └── main.tsx               # Application entry point
├── public/                    # Static assets (avatars, backgrounds, sounds)
├── package.json               # Frontend dependencies & scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Groq API Key**: (Optional for AI icebreakers) [Get your key here](https://console.groq.com/keys)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
# Optional: Add Groq API Key for live AI icebreakers
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.3-70b-versatile"

# Redis: default uses in-memory fakeredis (no local Redis server required)
USE_FAKE_REDIS=True
```

Run the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be running at: `http://localhost:8000`  
Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
# In the root directory:
npm install

# Start Vite development server
npm run dev
```
Frontend will be available at: `http://localhost:3000`

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests -v
```
All 8 automated test suites verify:
- Guest, Email, and Google OAuth flows
- Real-time Tic-Tac-Toe state machine and win detection
- System health and database connectivity
- Matching algorithms & queue pairing
- Reporting and safety block pipelines

### Frontend Type Check & Build
```bash
# Verify TypeScript types
npx tsc --noEmit

# Production bundle
npm run build
```

---

## 🌐 Production Deployment

### Option A: Cloud / VPS Deployment (e.g., Railway, Render, DigitalOcean)
1. **Frontend**: Deploy with Vercel, Netlify, or serve the static `dist/` directory via Nginx/Caddy.
2. **Backend**: Run with Gunicorn/Uvicorn workers on a containerized service.
3. **Environment Variables**:
   - `CORS_ORIGINS`: Point to your production frontend domain (e.g., `https://your-domain.com`).
   - `SECRET_KEY`: Generate a secure random 64-character secret.
   - `GROQ_API_KEY`: Provide your production Groq Cloud key.
   - `STUN_SERVER` / `TURN_SERVER`: Provide TURN credentials for restrictive NAT/firewall traversal.

### Option B: Docker
```bash
# Build and run backend container
cd backend
docker build -t stravair-backend .
docker run -p 8000:8000 --env-file .env stravair-backend
```

---

## 🛡️ Privacy & Safety Architecture

- **No Video Storage**: WebRTC connections stream peer-to-peer directly between browsers. No video frames touch the server.
- **Pseudonymous by Default**: Users are assigned temporary random session avatars and handles.
- **Client-Side Age Verification**: 18+ birthdate verification verified locally without sending birth dates to servers.
- **Zero Chat Inspection**: Conversations are ephemeral and cleared as soon as a session concludes.
- **Mutual Consensual Connections**: Contact exchange requires affirmative two-way consent from both parties.

---
