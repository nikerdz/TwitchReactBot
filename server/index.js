import 'dotenv/config'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import { startTwitchBot } from './twitchBot.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const docsDir = path.resolve(__dirname, '..', 'docs')
const clientDistDir = path.resolve(__dirname, '..', 'client', 'dist')
let staticDir = clientDistDir
if (fs.existsSync(docsDir)) {
  staticDir = docsDir
} else if (!fs.existsSync(clientDistDir)) {
  console.warn('Warning: no static build directory found in docs or client/dist')
}

console.log(`Serving static files from: ${staticDir}`)

app.use(cors())
app.use(express.json())

const reactions = []
const status = {
  connected: false,
  channel: process.env.TWITCH_CHANNEL || null,
  error: null
}

function addReaction(reaction) {
  reactions.unshift(reaction)
  if (reactions.length > 20) reactions.pop()
}

function updateStatus(update) {
  Object.assign(status, update)
}

app.get('/api/reactions', (req, res) => {
  res.json({ reactions, status })
})

app.get('/api/status', (req, res) => {
  res.json(status)
})

// Server-side proxy endpoint to obtain a Twitch App Access Token using
// client credentials. Keep `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`
// in server-side env (not committed).
app.get('/api/twitch/token', async (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Twitch client credentials not configured on server' })
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })

    const tokenRes = await fetch(`https://id.twitch.tv/oauth2/token?${params.toString()}`, {
      method: 'POST'
    })

    if (!tokenRes.ok) {
      const txt = await tokenRes.text()
      return res.status(502).json({ error: 'Failed to fetch token from Twitch', details: txt })
    }

    const json = await tokenRes.json()
    // Return only non-secret metadata to the client
    return res.json({ access_token: json.access_token, expires_in: json.expires_in, token_type: json.token_type })
  } catch (err) {
    console.error('Twitch token error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.use(express.static(staticDir))
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'))
})

const port = Number(process.env.PORT) || 5173
startTwitchBot({ onReaction: addReaction, onStatus: updateStatus })

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
