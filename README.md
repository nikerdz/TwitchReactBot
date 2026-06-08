# TwitchReactBot

A simple Twitch reaction web app that connects to a streamer chat, detects key phrases, and shows generated text reactions.

## What this repo includes

- `server/` — Node.js backend that connects to Twitch chat with `tmi.js`
- `client/` — React + Vite frontend that displays live reactions
- `vite.config.js` — frontend config and API proxy in development
- `.env.example` — environment variables for Twitch channel and bot credentials

## How to run locally

1. Copy `.env.example` to `.env` and add your values.
2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm run dev
```

4. Open the frontend in your browser:

- http://localhost:5174

## What to customize

- `TWITCH_CHANNEL` — the streamer chat to join
- `TWITCH_BOT_USERNAME` — the Twitch bot username
- `TWITCH_OAUTH_TOKEN` — the OAuth token for the bot account
- `server/twitchBot.js` — change the key phrases and reaction text
- `client/src/App.jsx` — update the UI to better match your assignment

## Notes

- The backend polls Twitch chat and stores the latest detected reactions.
- The frontend fetches `/api/reactions` every 2 seconds to show live updates.
- This is a starting structure; you can extend it with sockets, authentication, or richer UI.
