import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import { startTwitchBot } from './twitchBot.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const staticDir = path.resolve(__dirname, '..', 'client', 'dist')

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

app.use(express.static(staticDir))
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'))
})

const port = Number(process.env.PORT) || 5173
startTwitchBot({ onReaction: addReaction, onStatus: updateStatus })

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
