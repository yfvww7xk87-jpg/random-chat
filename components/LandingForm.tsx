'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateAnonId, saveChatPrefs } from '@/lib/anon-id'
import { useTheme } from '@/lib/theme-context'
import ThemeToggle from './ThemeToggle'

type Gender = 'male' | 'female'

export default function LandingForm() {
  const router = useRouter()
  const [gender, setGender] = useState<Gender | null>(null)
  const [filterGender, setFilterGender] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const { theme } = useTheme()
  const canStart = gender !== null && agreed && !loading

  async function handleStart() {
    if (!canStart || !gender) return
    setLoading(true)

    const userId = getOrCreateAnonId()
    const filter = filterGender ? (gender === 'male' ? 'female' : 'male') : null
    saveChatPrefs(gender, filter)

    const res = await fetch('/api/queue/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, gender, filter }),
    })

    const data = await res.json()

    if (data.status === 'matched') {
      router.push(`/chat?session=${data.sessionId}`)
    } else {
      router.push('/waiting')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '24px', background: theme.bg }}>
      {/* Theme toggle top right */}
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 320, background: theme.surface, borderRadius: 24, padding: 32, border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, marginBottom: 8, color: theme.textPrimary }}>
            Ome<span style={{ color: '#7c3aed' }}>Talk</span>
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: 14, margin: 0 }}>
            Chat with strangers for free.
          </p>
        </div>

        {/* Gender selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 11, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', margin: 0, fontWeight: 600 }}>I am a...</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['male', 'female'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                style={{
                  flex: 1, minHeight: 48, borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none',
                  background: gender === g ? '#7c3aed' : theme.surface2,
                  color: gender === g ? '#fff' : theme.textSecondary,
                  outline: gender !== g ? `1px solid ${theme.border}` : 'none',
                }}
              >{g.charAt(0).toUpperCase() + g.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {gender && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 36 }}>
              <input type="checkbox" checked={filterGender} onChange={e => setFilterGender(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#7c3aed', flexShrink: 0 }} />
              <span style={{ color: theme.textSecondary, fontSize: 14 }}>Only match with {gender === 'male' ? 'females' : 'males'}</span>
            </label>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minHeight: 36 }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#7c3aed', flexShrink: 0 }} />
            <span style={{ color: theme.textSecondary, fontSize: 14 }}>
              I am 18+ and agree to the{' '}
              <a href="/tos" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed' }}>Terms of Service</a>
            </span>
          </label>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            width: '100%', minHeight: 52, borderRadius: 14, fontWeight: 700, fontSize: 16, border: 'none', cursor: canStart ? 'pointer' : 'not-allowed',
            background: canStart ? '#7c3aed' : theme.surface2,
            color: canStart ? '#fff' : theme.textSecondary,
          }}
        >
          {loading ? 'Connecting...' : 'Start Chatting →'}
        </button>
      </div>
    </div>
  )
}
