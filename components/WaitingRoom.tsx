'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getOrCreateAnonId } from '@/lib/anon-id'
import { useTheme } from '@/lib/theme-context'
import ThemeToggle from './ThemeToggle'

export default function WaitingRoom() {
  const router = useRouter()
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const gender = searchParams.get('gender')
  const filter = searchParams.get('filter') || null

  useEffect(() => {
    if (!gender) { router.replace('/'); return }

    const supabase = createClient()
    const userId = getOrCreateAnonId()

    const channel = supabase.channel(`queue:${userId}`)

    channel
      .on('broadcast', { event: 'matched' }, (payload) => {
        const { sessionId } = payload.payload
        router.push(`/chat?session=${sessionId}`)
      })
      .subscribe()

    // Poll every 2 seconds: check if a session was created (fallback for missed broadcasts)
    const poll = setInterval(async () => {
      const res = await fetch(`/api/queue/status?userId=${userId}`)
      const data = await res.json()
      if (data.status === 'matched') {
        router.push(`/chat?session=${data.sessionId}`)
      }
    }, 2000)

    function handleUnload() {
      fetch('/api/queue/leave', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        keepalive: true,
      })
    }
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearInterval(poll)
      supabase.removeChannel(channel)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [router])

  async function handleCancel() {
    const userId = getOrCreateAnonId()
    await fetch('/api/queue/leave', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    router.push('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: 24, padding: 24, background: theme.bg, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </div>
      <div style={{ width: 56, height: 56, borderRadius: '50%', border: `4px solid ${theme.border}`, borderTopColor: '#7c3aed', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: theme.textPrimary, margin: 0, marginBottom: 8 }}>Looking for someone...</h2>
        <p style={{ color: theme.textSecondary, fontSize: 14, margin: 0 }}>You will be connected automatically</p>
      </div>
      <button
        onClick={handleCancel}
        style={{ color: theme.textSecondary, fontSize: 14, background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 10, padding: '8px 20px', cursor: 'pointer', marginTop: 8 }}
      >
        Cancel
      </button>
    </div>
  )
}
