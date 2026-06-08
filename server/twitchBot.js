import tmi from 'tmi.js'

const KEY_PHRASES = ['pog', 'hype', 'kekw']

function createReaction(phrase, message, user) {
  const templates = {
    pog: `🥳 That was pog! ${user} just brought the energy.`,
    hype: `🤩 Hype detected! The chat is buzzing around ${phrase}.`,
    kekw: `😂 ${user} got the whole chat laughing! KEKW moment!`  
  }
  return templates[phrase] || `Reacting to ${phrase}: ${message}`
}

export function startTwitchBot({ onReaction, onStatus }) {
  const channel = process.env.TWITCH_CHANNEL
  const username = process.env.TWITCH_BOT_USERNAME
  const token = process.env.TWITCH_OAUTH_TOKEN

  if (!channel || !username || !token) {
    onStatus({ connected: false, error: 'Missing TWITCH_CHANNEL, TWITCH_BOT_USERNAME, or TWITCH_OAUTH_TOKEN' })
    return
  }

  const client = new tmi.Client({
    options: { debug: false },
    identity: {
      username,
      password: token
    },
    channels: [channel]
  })

  client.connect()
    .then(() => onStatus({ connected: true, channel, error: null }))
    .catch((error) => onStatus({ connected: false, channel, error: error.message }))

  client.on('message', (channelName, userstate, message, self) => {
    if (self) return

    const lowercased = message.toLowerCase()
    KEY_PHRASES.forEach((phrase) => {
      if (lowercased.includes(phrase)) {
        onReaction({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          timestamp: new Date().toISOString(),
          user: userstate['display-name'] || userstate.username,
          phrase,
          message,
          reaction: createReaction(phrase, message, userstate['display-name'] || userstate.username)
        })
      }
    })
  })
}
