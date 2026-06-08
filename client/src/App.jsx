import { useEffect, useState } from 'react'

function App() {
  const [data, setData] = useState({ reactions: [], status: { connected: false, channel: null, error: null } })

  useEffect(() => {
    async function fetchReactions() {
      try {
        const response = await fetch('https://backend-bridge--bugwoozin.replit.app/api/reactions')
        if (!response.ok) throw new Error('Failed to fetch reactions')
        setData(await response.json())
      } catch (error) {
        console.error(error)
      }
    }

    fetchReactions()
    const interval = setInterval(fetchReactions, 2000)
    return () => clearInterval(interval)
  }, [])

  const { reactions, status } = data
  return (
    <div className="app-shell">
      <header>
        <h1>Twitch Reaction Bot</h1>
        <p className="subtitle">Connects to a streamer chat, detects keywords, and shows reactions.</p>
      </header>

      <section className="status-card">
        <div>
          <strong>Channel:</strong> {status.channel || 'Not configured'}
        </div>
        <div>
          <strong>Connected:</strong> {status.connected ? 'Yes' : 'No'}
        </div>
        {status.error ? <div className="error">{status.error}</div> : null}
      </section>

      <section className="reaction-feed">
        <h2>Live reaction feed</h2>
        <p className="keyword-note">
          Say any of these keywords in chat: <strong>pog</strong>, <strong>hype</strong>, <strong>kekw</strong>
        </p>
        {reactions.length === 0 ? (
          <p>No reactions yet. Open the Twitch channel chat and say one of the keywords above.</p>
        ) : (
          <ul>
            {reactions.map((reaction) => (
              <li key={reaction.id}>
                <div className="reaction-header">
                  <span>{reaction.user}</span>
                  <span>{new Date(reaction.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="reaction-text">{reaction.reaction}</div>
                <div className="reaction-message">"{reaction.message}"</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
