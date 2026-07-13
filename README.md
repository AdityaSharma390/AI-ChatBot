# AI Chat Assistant 🤖

AI Chat Assistant is a secure, production-ready, full-stack conversational chatbot built using **React.js (Vite)**, **Node.js (Express)**, **MongoDB (Mongoose)**, and the **Google Gemini API**. 

Equipped with JWT authentication, real-time typing states, Markdown/syntax code rendering, voice input/output synthesis, multi-modal document uploads, and keyless Stable Diffusion image generation fallback, this app delivers a premium, ChatGPT-inspired user experience.

---

## Features

### 💻 ChatGPT-Inspired User Interface
- Collapsible sidebar drawer for screen-size adaptability.
- Glassmorphism overlays and vibrant dark/light theme options.
- Dynamic typing animations and loader indicators.

### 🔐 Security & Production Architecture
- **JWT Session Tokens**: Protected API headers with local storage persistence.
- **Password Hashing**: Secure encryption via `bcryptjs`.
- **IP Rate Limiting**: Limiters configured on chat and authorization routes.
- **Helmet Headers**: Enhanced security headers loaded onto the Express stack.
- **Morgan & Winston logging**: Production logging streams tracking requests and issues.

### 📄 Advanced Chat Capabilities
- **Google Gemini 1.5 Flash Integration**: Multi-turn history context for smart conversations.
- **Multimodal File Processing**: Upload PDFs, plaintext files, or PNG/JPG images. Images are processed natively; documents are parsed on-the-fly and added to the prompt.
- **Stable Diffusion Images**: Keyless image generation fallback via Pollinations.ai or OpenAI DALL-E.
- **Speech Controls**: Integrated Speech-to-Text (STT) voice recognition and Speech-to-Text (TTS) voice playback synthesis.
- **Exporting Options**: Download conversation histories instantly to TXT, Markdown, or PDF format.
- **Analytics Dashboard**: Sidebar dashboard visualizing total conversations, message frequency, and category breakdowns.
- **Category Filter, Pins, and Favorites**: Keep chats organized with custom categories, pins, and star highlights.

---

## Folder Structure

```text
ai-chat-assistant/
├── client/                 # React.js (Vite) Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI (Sidebar, ChatWindow, MessageItem)
│   │   ├── pages/          # LandingPage, Login, Register, ChatPage, NotFound
│   │   ├── hooks/          # useVoice (speech APIs helper)
│   │   ├── context/        # React Context (Auth, Theme, Chat)
│   │   ├── services/       # Axios client settings
│   │   ├── assets/         # Stylesheet entries
│   │   ├── App.jsx         # Routes
│   │   ├── index.css       # Tailwind setup
│   │   └── main.jsx        # App mounting
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── server/                 # Node.js Express Backend
    ├── config/             # DB & Winston configs
    ├── controllers/        # Express controllers (auth, chat, image)
    ├── middleware/         # Auth filters, error catches, rate limiters
    ├── models/             # Mongoose schemas (User, Conversation, Message)
    ├── routes/             # API routes
    ├── services/           # Gemini API integrations
    ├── uploads/            # Temporary upload storage
    ├── logs/               # Saved log files
    ├── .env.example        # Environment variables guide
    ├── package.json
    └── server.js           # Server runner entrypoint
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or a MongoDB Atlas URI)
- Google Gemini API Key (Obtain from Google AI Studio)

### Step 1: Clone and Configure Backend
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file and insert your API keys:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ai-chat-assistant
   JWT_SECRET=insert_your_secret_key
   GEMINI_API_KEY=insert_your_google_studio_api_key
   ```

### Step 2: Configure Frontend
1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Launch Vite Dev server:
   ```bash
   npm run dev
   ```

The frontend will run at `http://localhost:5173`. Vite is pre-configured with a proxy, routing `/api` calls directly to the Express server at `http://localhost:5000`.

---

## Environment Variables

| Variable | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `PORT` | Express listening port | No | `5000` |
| `NODE_ENV` | Mode of deployment (`development`/`production`) | No | `development` |
| `MONGODB_URI` | Connection string for MongoDB | Yes | `mongodb://localhost:27017/ai-chat-assistant` |
| `JWT_SECRET` | Secret key used to sign Auth tokens | Yes | - |
| `GEMINI_API_KEY` | Google Gemini AI Studio API key | Yes | - |
| `GEMINI_MODEL` | Google Gemini model to query | No | `gemini-1.5-flash` |
| `OPENAI_API_KEY` | OpenAI API key (optional fallback for DALL-E) | No | - |
| `CLIENT_URL` | Frontend URL for CORS configuration | No | `http://localhost:5173` |

---

## API Documentation

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Create a new profile. Returns JWT session token.
- `POST /api/auth/login` - Verify user credentials. Returns JWT session token.
- `GET /api/auth/me` - Retrieve current user profile details (JWT protected).

### Chat Routes (`/api/chat`)
- `GET /api/chat/history` - Retrieve chats list (JWT protected). Supports filters:
  - `?search=term`
  - `?category=Work`
  - `?isFavorite=true`
  - `?isPinned=true`
- `GET /api/chat/:id` - Fetch chat details and message list.
- `POST /api/chat` - Send user prompt and get AI response. Accept optional document/image uploads.
- `POST /api/chat/new` - Initialize an empty chat conversation.
- `PUT /api/chat/:id` - Update title, category, pin status, or favorite status.
- `DELETE /api/chat/:id` - Delete chat and associated message histories.
- `GET /api/chat/stats` - Fetch user statistics and graphs data.

### Image Generation (`/api/image`)
- `POST /api/image/generate` - Generate an image from a text description.

---

## Deployment Steps

### Frontend (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the `client/` directory.
3. Configure the environment variable:
   - `VITE_API_URL` = (Your deployed backend API URL, e.g. `https://my-backend.onrender.com/api`)

### Backend (Render)
1. Create a Web Service on Render and link your Github repository.
2. Set Build Command: `npm install`
3. Set Start Command: `node server.js` (inside `server/` subdirectory).
4. Add Environment Variables under settings:
   - `MONGODB_URI` (MongoDB Atlas URI)
   - `GEMINI_API_KEY`
   - `JWT_SECRET`
   - `CLIENT_URL` (Your Vercel deployment URL)
   - `NODE_ENV` = `production`

---

## Screenshots Placeholder

*(Future screenshots can be inserted here demonstrating the glowing glassmorphic interface, dark mode toggle, file drop zones, and analytics graphs)*
