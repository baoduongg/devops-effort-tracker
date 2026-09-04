# DevOps Effort Tracker

A Next.js 15 application for tracking effort allocation across projects, managing team capacity, and enabling AI-assisted planning through Firebase and a Gemini-powered AI gateway.

## Project Purpose

DevOps Effort Tracker helps leaders and DevOps engineers:
- Track and visualize team member workload and effort allocation across projects
- Monitor project timelines and resource constraints
- Create and manage tasks with AI assistance (via chat interface)
- Receive notifications for budget overages and capacity issues

## Getting Started

### Installation

```bash
pnpm install
```

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

### Environment Variables

Create a `.env.local` file by copying `.env.local.example` and filling in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key | Firebase Console → Project Settings → API keys |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain | Firebase Console → Project Settings (format: `your-project.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket name | Firebase Console → Project Settings (format: `your-project.appspot.com`) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Firebase Console → Project Settings |
| `AI_GATEWAY_URL` | Base URL of the local ai-gateway Python service | Default: `http://localhost:8001` (see `ai-gateway/README.md` to run it) |

All `NEXT_PUBLIC_*` variables are safe to expose and are restricted by Firebase security rules. Server-only variables (like `NVIDIA_API_KEY`) must never be prefixed with `NEXT_PUBLIC_`.

### Authentication

Enable Google sign-in in Firebase Console → Authentication → Sign-in method → Google, and add `localhost` to authorized domains for local dev.

### Seeding Data

To seed the database with sample data, run:

```bash
pnpm run seed
```

### Firestore Indexes

The personal timeline query (`tasks` filtered by `memberId`, ordered by `startDate`) requires a composite index. On first run, Firestore will throw a "query requires an index" error with a direct link to create it in the console — click the link and wait for the index to show as "Enabled" before retrying.

### AI Gateway (Python)

AI features (chat-based entry logging and leader Q&A) are powered by a
separate Python FastAPI service in `ai-gateway/` that wraps
[gemini_webapi](https://github.com/HanaokaYuzu/Gemini-API), an **unofficial**
client for the Gemini web app. See `ai-gateway/README.md` for setup and
important risk notes before relying on this in any production-like
environment.

Quick start:

```bash
cd ai-gateway
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8001
```

The Next.js app must be able to reach this service at `AI_GATEWAY_URL`
(default `http://localhost:8001`) for `/chat` and leader Q&A features to work.

## Build and Deployment

Build the production-optimized app:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```
