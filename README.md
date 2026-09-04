# DevOps Effort Tracker

A Next.js 15 application for tracking effort allocation across projects, managing team capacity, and enabling AI-assisted planning through Firebase and NVIDIA NIM APIs.

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
| `NVIDIA_API_KEY` | NVIDIA NIM API key for LLM access | [NVIDIA Build](https://build.nvidia.com) → API keys (server-side only, never expose) |
| `NVIDIA_TEXT_MODEL` | NVIDIA text model ID | Default: `meta/llama-3.1-405b-instruct` |
| `NVIDIA_VISION_MODEL` | NVIDIA vision model ID | Default: `meta/llama-3.2-90b-vision-instruct` |

All `NEXT_PUBLIC_*` variables are safe to expose and are restricted by Firebase security rules. Server-only variables (like `NVIDIA_API_KEY`) must never be prefixed with `NEXT_PUBLIC_`.

### Authentication

Enable Google sign-in in Firebase Console → Authentication → Sign-in method → Google, and add `localhost` to authorized domains for local dev.

### Seeding Data

To seed the database with sample data, run:

```bash
pnpm run seed
```

(See Task 10 for implementation details.)

## Build and Deployment

Build the production-optimized app:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```
