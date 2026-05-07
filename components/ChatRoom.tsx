'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getOrCreateAnonId, loadChatPrefs } from '@/lib/anon-id'
import { useTheme } from '@/lib/theme-context'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ReportModal from './ReportModal'
import ThemeToggle from './ThemeToggle'

interface Message {
  id: string
  text: string
  senderId: string
  sentAt: string
}

interface Props {
  sessionId: string
  userA: string
  userB: string
}

export default function ChatRoom({ sessionId, userA, userB }: Props) {
  const router = useRouter()
  const { theme } = useTheme()
  const [userId, setUserId] = useState('')
  const partnerId = userId === userA ? userB : userA

  const [messages, setMessages] = useState<Message[]>([])
  const [partnerLeft, setPartnerLeft] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const partnerTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const id = getOrCreateAnonId()
    setUserId(id)
    if (id !== userA && id !== userB) {
      router.replace('/')
    }
  }, [userA, userB, router])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`chat:${sessionId}`)
    channelRef.current = channel

    channel
      .on('broadcast', { event: 'message' }, (payload) => {
        const msg = payload.payload as Message
        setMessages(prev => [...prev, msg])
      })
      .on('broadcast', { event: 'partner_left' }, () => {
        setPartnerLeft(true)
      })
      .on('broadcast', { event: 'typing' }, () => {
        setPartnerTyping(true)
        if (partnerTypingTimer.current) clearTimeout(partnerTypingTimer.current)
        partnerTypingTimer.current = setTimeout(() => setPartnerTyping(false), 2000)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const gone = leftPresences.some((p: any) => p.userId === partnerId)
        if (gone) setPartnerLeft(true)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId })
        }
      })

    return () => {
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [sessionId, userId, partnerId])

  function handleTyping() {
    const channel = channelRef.current
    if (!channel) return
    channel.send({ type: 'broadcast', event: 'typing', payload: {} })
  }

  async function sendMessage(text: string) {
    const channel = channelRef.current
    if (!channel) return

    const supabase = createClient()
    const message: Message = {
      id: crypto.randomUUID(),
      text,
      senderId: userId,
      sentAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, message])

    await channel.send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    })

    await supabase.from('messages').insert({
      id: message.id,
      session_id: sessionId,
      sender_id: userId,
      text,
      sent_at: message.sentAt,
    })
  }

  async function handleStop() {
    await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    router.push('/')
  }

  async function handleNext() {
    await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    const prefs = loadChatPrefs()
    if (!prefs) { router.push('/'); return }

    const res = await fetch('/api/queue/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, gender: prefs.gender, filter: prefs.filter }),
    })
    const data = await res.json()
    if (data.status === 'matched') {
      router.push(`/chat?session=${data.sessionId}`)
    } else {
      router.push('/waiting')
    }
  }

  async function handleReport(reason: string) {
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reporterId: userId, reportedId: partnerId, sessionId, reason }),
    })
    setShowReport(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: theme.bg }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 600, width: '100%', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: partnerLeft ? '#ef4444' : '#22c55e', flexShrink: 0 }} />
            <span style={{ fontSize: 17, fontWeight: 600, color: theme.textPrimary }}>
              {partnerLeft ? 'Disconnected' : 'Stranger'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <button
              onClick={() => setShowReport(true)}
              style={{ color: theme.textSecondary, fontSize: 14, padding: '7px 13px', borderRadius: 10, background: 'transparent', border: `1px solid ${theme.border}`, cursor: 'pointer' }}
            >
              Report
            </button>
            <button
              onClick={handleStop}
              title="Stop chatting"
              style={{ color: '#ef4444', fontSize: 14, padding: '7px 13px', borderRadius: 10, background: 'transparent', border: '1px solid #ef444466', cursor: 'pointer', fontWeight: 600 }}
            >
              Stop
            </button>
          </div>
        </div>

        {/* Partner left banner */}
        {partnerLeft && (
          <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}`, padding: '20px', textAlign: 'center' }}>
            <p style={{ color: theme.textSecondary, marginBottom: 16, fontSize: 15 }}>Your partner has left the chat.</p>
            <button
              onClick={handleNext}
              style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              New Chat →
            </button>
          </div>
        )}

        {/* Messages */}
        <MessageList messages={messages} myUserId={userId} />

        {/* Bottom bar */}
        <div style={{ background: theme.surface, borderTop: `1px solid ${theme.border}` }}>
          <div style={{ padding: '12px 16px 8px' }}>
            <button
              onClick={handleNext}
              style={{ width: '100%', background: theme.surface2, color: theme.textSecondary, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 46 }}
            >
              Next stranger →
            </button>
          </div>
          {partnerTyping && !partnerLeft && (
            <div style={{ paddingLeft: 20, paddingBottom: 4, fontSize: 13, color: theme.textSecondary, fontStyle: 'italic' }}>
              Stranger is typing...
            </div>
          )}
          <MessageInput onSend={sendMessage} onTyping={handleTyping} disabled={partnerLeft} />
        </div>

      </div>

      {showReport && (
        <ReportModal onReport={handleReport} onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}
