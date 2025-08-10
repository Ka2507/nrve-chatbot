# NRVE Fullstack (Client + Server)

This includes:
- **client/**: Vite + React + TS + Tailwind
- **server/**: Express API
  - `POST /api/chat` → OpenAI-backed (or mock if no API key)
  - `GET/POST/DELETE /api/journal` → JSON-file persistence

## Quick Start (Local)
```bash
# 1) Install everything
npm run install:all

# 2) (Optional) set your OpenAI key for real chatbot replies
# mac/linux
export OPENAI_API_KEY=sk-...

# windows powershell
# $env:OPENAI_API_KEY="sk-..."

# 3) Run both client + server together
npm run dev
# client: http://localhost:5173  (proxied /api -> server)
# server: http://localhost:4000
```

## Build client
```bash
npm run build
```

## Notes
- Journals are stored server-side in `server/journal.json`.
- Update brand colors in `client/src/App.tsx` (CSS variables on `#nrve-root`).

