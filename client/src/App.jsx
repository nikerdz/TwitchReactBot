import { useEffect, useState } from 'react'

const PHRASE_COLORS = {
  pog: 'phrase-pog',
  hype: 'phrase-hype',
  kekw: 'phrase-kekw',
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export default function App() {
  const [data, setData] = useState({ reactions: [], status: { connected: false, channel: null, error: null } })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let mounted = true
    async function fetchReactions() {
      try {
        const response = await fetch(`${API_BASE}/reactions`)
        if (!response.ok) throw new Error('Failed to fetch reactions')
        const json = await response.json()
        if (mounted) setData(json)
      } catch (error) {
        console.error(error)
      }
    }

    fetchReactions()
    const id = setInterval(() => {
      fetchReactions()
      setTick((t) => t + 1)
    }, 2000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  const { reactions, status } = data

  return (
    <div className="app-shell">
      <div className="top-row">
        <div className="brand">
          <span className="robot">🤖</span>
          <div>
            <h1 className="brand-title">TwitchReactBot</h1>
            <p className="brand-sub">API Status Dashboard</p>
          </div>
        </div>
      </div>

      <div className="card status-card-2">
        <p className="muted-label">Bot Status</p>
        {!status ? (
          <p className="muted">Connecting...</p>
        ) : (
          <div className="status-row">
            <span className={`dot ${status.connected ? 'online' : 'offline'}`} />
            <div>
              <p className={`status-text ${status.connected ? 'online-text' : 'offline-text'}`}>
                {status.connected ? 'Connected' : 'Disconnected'}
              </p>
              {status.channel && (
                <p className="channel-text">
                  Channel:{' '}
                  <a href={`https://twitch.tv/${status.channel}`} target="_blank" rel="noreferrer" className="channel-link">
                    {status.channel}
                  </a>
                  <br /> Keywords: Pog, Hype, KekW
                </p>
              )}
              {status.error && <p className="error">{status.error}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="card reactions-card">
        <div className="card-header">
          <p className="muted-label">Live Reactions</p>
          <span className="muted-count">{(reactions && reactions.length) || 0} / 20</span>
        </div>

        <p className="keyword-note">
          Say any of these keywords in chat: <strong>pog</strong>, <strong>hype</strong>, <strong>kekw</strong>
        </p>

        {(!reactions || reactions.length === 0) ? (
          <p className="no-reactions">No reactions yet — waiting for chat messages...</p>
        ) : (
          <ul className="reaction-list">
            {reactions.map((r) => (
              <li key={r.id} className="reaction-item">
                <div className="reaction-top">
                  <div className="user-block">
                    <span className="user-name">{r.user}</span>
                    <span className={`phrase-badge ${PHRASE_COLORS[r.phrase] || 'phrase-default'}`}>{r.phrase}</span>
                  </div>
                  <span className="timeago">{timeAgo(r.timestamp)}</span>
                </div>
                <p className="reaction-message">"{r.message}"</p>
                <p className="reaction-reaction">{r.reaction}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="footer">Auto-refreshes every 2s · tick {tick}</p>
    </div>
  )
}
