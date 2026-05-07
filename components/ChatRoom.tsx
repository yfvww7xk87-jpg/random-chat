'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getOrCreateAnonId } from '@/lib/anon-id'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ReportModal from './ReportModal'

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
  const userId = getOrCreateAnonId()
  const partnerId = userId === userA ? userB : userA

  const [messages, setMessages] = useState<Message[]>([])
  const [partnerLeft, setPartnerLeft] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const channelRef = useRef<RealtimeChannel | null>(null)

  // Guard: redirect if user is not part of this session
  useEffect(() => {
    if (userId !== userA && userId !== userB) {
      router.replace('/')
    }
  }, [userId, userA, userB, router])

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

  async function handleNext() {
    await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    router.push('/')
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
    <div className="flex flex-col h-dvh">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <span className="text-sm text-gray-400">
          {partnerLeft ? 'Partner has left' : 'Connected with a stranger'}
        </span>
        <button
          onClick={() => setShowReport(true)}
          className="text-gray-500 text-xs hover:text-red-400 transition-colors"
          style={{ minHeight: 44, paddingLeft: 8, paddingRight: 8 }}
        >
          Report
        </button>
      </div>

      {partnerLeft && (
        <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 text-center">
          <p className="text-gray-300 text-sm mb-2">Your partner has left.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#7c3aed] text-white rounded-xl px-6 py-2 text-sm font-semibold hover:bg-[#6d28d9]"
          >
            New Chat
          </button>
        </div>
      )}

      <MessageList messages={messages} myUserId={userId} />

      <div className="border-t border-[#2a2a2a]">
        <div className="px-4 pt-2">
          <button
            onClick={handleNext}
            className="w-full bg-[#2a2a2a] text-gray-300 rounded-xl py-2 text-sm font-semibold hover:bg-[#3a3a3a] transition-colors"
            style={{ minHeight: 44 }}
          >
            Next →
          </button>
        </div>
        <MessageInput onSend={sendMessage} disabled={partnerLeft} />
      </div>

      {showReport && (
        <ReportModal onReport={handleReport} onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}
