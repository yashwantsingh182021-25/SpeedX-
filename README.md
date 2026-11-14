# SpeedX — Hinglish → proper English

Type the way you talk. SpeedX turns Hinglish and chat-style text into proper English,
lets you send it straight to WhatsApp, and shows how your English improves over time.

## Features

- **Proper English ON / OFF** — ON converts your message; OFF sends it exactly as typed (free-hand chatting with friends).
- **Offline engine (free)** — runs on your phone, no internet or account needed. Handles common Hinglish phrases,
  Hindi verb phrases (`main ghar ja raha hoon` → `I am going home`), chat short-forms (`u r`, `pls`, `becoz`),
  spelling, grammar (`he dont`, `she go`, `a apple`), missing verbs (`i going`, `you free?`), capitals and punctuation.
- **AI mode (optional)** — full-sentence translation with Claude, Friendly or Formal tone. Uses your own API key,
  stored only on your device.
- **Before / after view** — every change is highlighted with a short explanation.
- **Insights** — your English score per message (what you typed vs. after SpeedX), mistakes by type
  (spelling, grammar, missing verb, Hinglish, short-forms…), words you keep fixing, and a tip for your weakest area.
- **Light & dark mode** — follows your phone, or pick one.
- **WhatsApp** — *Send on WhatsApp* opens WhatsApp with the message filled in; after installing the app,
  SpeedX appears in Android's **Share** menu, so you can share text from WhatsApp into SpeedX to fix it.
- **Installable & offline** (PWA). All data stays on the device.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # engine tests
npm run build    # static site in dist/
```

## Put it on your phone

1. Push to `main` and enable **Settings → Pages → Source: GitHub Actions** in the repo
   (the included workflow builds and deploys automatically).
2. Open the Pages URL in Chrome on Android → ⋮ → **Install app**.

## How WhatsApp integration works (and its limits)

WhatsApp doesn't let other apps change text inside its own typing box. SpeedX works *alongside* it:

| Flow | How |
|---|---|
| Write in SpeedX → send | Tap **Send on WhatsApp**, pick the chat, the message is pre-filled. |
| Fix text from WhatsApp | Long-press / select text → **Share** → **SpeedX** → converted → send back. |
| Quick copy | **Copy** (or turn on *Copy automatically*) and paste into any chat. |

Converting *while typing inside WhatsApp* needs a native Android keyboard app (IME). The engine in
`src/engine.js` is plain JavaScript with no dependencies, so it can be reused in that keyboard later.

## Project layout

```
index.html          app shell (Write / Insights / Settings)
src/engine.js       offline Hinglish → English engine + scoring + diff
src/ai.js           optional Claude engine (structured JSON output)
src/charts.js       small SVG charts with hover tooltips
src/main.js         UI logic, storage, WhatsApp/share, insights
public/             manifest (share target), service worker, icons
tests/              engine tests (node --test)
```
