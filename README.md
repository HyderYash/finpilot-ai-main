# FinPilot AI

**AI-powered financial copilot for Indian investors** — built for Innovyuh 2.0 (GDG @ MIT ACSC).

FinPilot explains stocks, SIPs, and market concepts in simple language (including Hinglish, Hindi, and Marathi) and surfaces **Generative UI** recommendation cards when you ask for investment advice. Designed for **500M+ new investors** from Tier 2/3 India where English isn’t primary — multi-language and glossary tooltips are core accessibility, not just features.

---

## 🚀 Innovyuh 2.0 — Judging alignment

### 1. Google Technologies (15%)

- **Gemini 2.5 Flash** (`@google/generative-ai`) powers all AI reasoning and **structured outputs**: the model returns `RECOMMENDATION` JSON blocks that the app renders as interactive cards (Generative UI). Stock context is injected into the system prompt so recommendations are data-aware.
- **Firebase Hosting:** One-command deploy (see below). `firebase.json` is included with SPA rewrites.
- **Google AI Studio / Vertex:** Use the same API key from [Google AI Studio](https://aistudio.google.com/apikey); production can switch to Vertex AI with minimal change.
- **Project IDX:** Repo is ready to open in [Project IDX](https://idx.google.com); set `VITE_GEMINI_API_KEY` in environment variables for instant preview.

### 2. Impact on people & inclusivity (15%)

- **Rural reach:** Hindi and Marathi response modes target Tier 2/3 users. The “Reply in” dropdown isn’t a nice-to-have — it’s an accessibility tool for first-time investors who are more comfortable in regional language.
- **Glossary tooltips:** Hover over terms like “P/E ratio”, “SIP”, “Nifty 50” in any AI reply to see a one-line definition. Reduces friction for users who’ve never seen these terms.
- **Voice input:** Web Speech API (en-IN) lets users ask by voice — critical for low-literacy or mobile-first users.
- **Small business:** FinPilot can answer GST savings, business insurance, and surplus parking for shop owners (see prompt and suggestions in code).

### 3. Business value & market potential (15%)

- **Affiliate / lead model:** Recommendation cards include an **“Invest via partner”** CTA (e.g. Invest via Groww/Zerodha). When users act on a recommendation, FinPilot can earn via affiliate or lead referral — scalable without charging end users.
- **Monetization path:** Free tier for literacy + discovery; premium or B2B (banks, NBFCs) for deeper analytics or white-label.

---

## Tech stack

- **Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui
- **AI:** Google **Gemini 2.5 Flash** (`@google/generative-ai`) — structured JSON outputs for recommendation cards
- **Charts:** Yahoo Finance Chart API (proxied in dev), lightweight-charts
- **Voice:** Web Speech API (voice input in chat)

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Gemini API key**  
   Get a key at [Google AI Studio](https://aistudio.google.com/apikey), then:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and set:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run**
   ```bash
   npm run dev
   ```
   Open http://localhost:8080

---

## Deploy to Firebase Hosting (recommended for judging)

Firebase is part of the Google ecosystem and scores under “Google Technologies.”

**First-time setup (do this once):**

1. Install the CLI and log in:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Link a Firebase project** (required — the “No currently active project” error means this step wasn’t done):
   ```bash
   firebase use --add
   ```
   - Pick an existing project from the list, or create one at [Firebase Console](https://console.firebase.google.com/) first, then run `firebase use --add` again and select it.
   - This creates a `.firebaserc` file with your project id (you can commit it so teammates use the same project).

3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

**Later deploys** (after project is set):

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` is already in the repo: `public` is `dist`, and all routes rewrite to `/index.html` for client-side routing.

---

## Features

- **Context-aware chat:** From a stock page, “Discuss with FinPilot” sends symbol and price context; the AI references the stock in answers and recommendations.
- **Response language:** English, हिंदी, or मराठी in the chat header — next response follows the selected language.
- **Voice input:** Mic button in chat uses Web Speech API (en-IN).
- **Generative UI:** When Gemini recommends a product, the app renders an **InvestmentRecommendationCard** with risk score, “Why this fits you”, **Invest via partner** CTA, and Share/Explore.
- **Demo mode:** Dashboard “Try the demo — 30 sec” auto-sends a first-time investor question and shows the full flow.
- **Small business:** Ask about GST savings, business insurance, or parking surplus; suggestions and prompt support this persona.

## Project structure

- `src/lib/llm.ts` — Gemini client, system prompt (Financial Inclusion Officer, small business aware), language instructions
- `src/lib/chatParse.ts` — Parses `RECOMMENDATION` JSON blocks for Generative UI
- `src/components/InvestmentRecommendationCard.tsx` — Card with Risk Score, “Why this fits you”, Invest via partner, Share
- `src/data/mockUser.ts` — Demo profiles (first-time investor, small business)
- `firebase.json` — Firebase Hosting config (dist + SPA rewrites)

---

Built for **Innovyuh 2.0** · GDG @ MIT ACSC
