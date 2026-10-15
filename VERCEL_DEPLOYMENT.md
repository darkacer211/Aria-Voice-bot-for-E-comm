# Deploying Aria AI Voice Concierge to Vercel

This Next.js 16 application is pre-configured and verified for one-click deployment on [Vercel](https://vercel.com).

---

## 🚀 Quick Deploy Steps

### Step 1: Import Project in Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
2. Select your GitHub repository:
   ```
   darkacer211/Aria-Voice-bot-for-E-comm
   ```
3. Vercel will automatically detect:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
   - **Build Command:** `next build`
   - **Output Directory:** `.next`

---

### Step 2: Configure Environment Variables
In the **Environment Variables** section on Vercel, add the following key:

| Variable Name | Required | Description | Example |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | Gemini API Key from Google AI Studio | `AIzaSy...` or `AQ.Ab...` |
| `NEXT_PUBLIC_GEMINI_LIVE_MODEL` | No (optional) | Live API Model override | `gemini-2.5-flash-native-audio-preview-12-2025` |
| `NEXT_PUBLIC_GEMINI_VOICE` | No (optional) | Voice personality (`Aoede`, `Kore`, `Puck`) | `Aoede` |

> [!IMPORTANT]
> Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
> The `GEMINI_API_KEY` is securely kept on the server and is **never** sent to the client browser. Ephemeral tokens are minted via `/api/token`.

---

### Step 3: Deploy & Verify
1. Click **"Deploy"**.
2. Vercel will run `next build`, compile the static storefront, and mount the serverless API routes (`/api/token`, `/api/summary`, `/api/tools/*`).
3. Once deployed, open your live Vercel URL (e.g., `https://aria-voice-bot-for-e-comm.vercel.app`):
   - Click **"Ask Aria"** or **"Start Voice Concierge"**.
   - Grant microphone permissions when prompted by your browser.
   - Speak naturally: *"Where is my order ORD-101?"*
   - Verify real-time bidirectional audio and post-call summary generation!

---

## 🛠 Local Pre-Deployment Checks Passed

- **ESLint:** Zero errors, zero warnings (`npm run lint`).
- **Unit & Regression Tests:** 23/23 tests passing (`npm run test`).
- **Production Build:** Next.js Turbopack production bundle compiled successfully (`npm run build`).
- **Security:** `.env.local` is strictly ignored; only `.env.example` is committed.
