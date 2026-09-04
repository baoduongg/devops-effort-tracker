# ai-gateway

A thin FastAPI service that wraps [gemini_webapi](https://github.com/HanaokaYuzu/Gemini-API)
(`HanaokaYuzu/Gemini-API`) so the Next.js app in this repo can use Google
Gemini for its AI features without embedding a Python dependency directly
in the Node app.

## ⚠️ Important risk notes

`gemini_webapi` is an **unofficial, reverse-engineered client**. It is not
Google's official Gemini API SDK. It works by reusing a signed-in Google
account's session cookies to talk to the gemini.google.com web app. Before
relying on this:

- Google can change the web frontend at any time with no notice, which can
  break this client until the library is updated upstream.
- It depends on session cookies (`__Secure-1PSID`, `__Secure-1PSIDTS`) that
  expire and need periodic refresh. This service uses `browser-cookie3` to
  read them automatically from a logged-in browser on the same machine —
  it does **not** work on a headless server with no browser profile.
- Automating a personal Google account this way is against the spirit of
  Google's consumer ToS for that product; use an account you're comfortable
  taking that risk with, and never a shared/production account.
- This is appropriate for an internal tool like this one, not for anything
  that needs an uptime guarantee.

## Setup

Requires Python 3.11+ and a local browser (Chrome or Firefox) that is
currently logged into a Google account with access to gemini.google.com.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # edit AI_GATEWAY_PORT if needed
uvicorn main:app --port 8001
```

Authentication is attempted eagerly at startup (not lazily on first
request): the server reads Google session cookies from your local browser
and calls Gemini's init endpoint before it starts accepting traffic.

Visit `http://localhost:8001/health` to confirm it's running — this
always responds once the process is up, regardless of whether Gemini
auth succeeded. If startup auth fails (e.g. no browser is logged into
gemini.google.com, or the session cookies expired), the server still
starts and `/health` still responds, but `/format-entry` and
`/answer-query` will return `502` until you log into gemini.google.com
in your browser and **restart** the service — cookies are read fresh
from the browser on every startup, so a restart is what re-triggers
authentication (there's no lazy retry on a later request).

## Endpoints

- `POST /format-entry` — `{"prompt": string, "imageUrl": string | null}` →
  `{"raw": string}`
- `POST /answer-query` — `{"prompt": string}` → `{"raw": string}`

Both endpoints are intentionally "dumb": they don't know about this
project's data shapes. All parsing and validation of Gemini's output
happens in the Next.js app (`app/api/ai/*/route.ts`).
