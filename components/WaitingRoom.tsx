'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getOrCreateAnonId } from '@/lib/anon-id'

export default function WaitingRoom() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const userId = getOrCreateAnonId()

    const channel = supabase.channel(`queue:${userId}`)

    channel
      .on('broadcast', { event: 'matched' }, (payload) => {
        const { sessionId } = payload.payload
        router.push(`/chat?session=${sessionId}`)
      })
      .subscribe()

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
    <div className="flex flex-col items-center justify-center min-h-dvh gap-6 px-4">
      <div className="w-16 h-16 rounded-full border-4 border-[#2a2a2a] border-t-[#7c3aed] animate-spin" />
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Looking for someone...</h2>
        <p className="text-gray-400 text-sm">You will be connected automatically</p>
      </div>
      <button
        onClick={handleCancel}
        className="text-gray-500 text-sm hover:text-gray-300 transition-colors mt-4"
      >
        Cancel
      </button>
    </div>
  )
}
