'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateAnonId } from '@/lib/anon-id'

type Gender = 'male' | 'female'

export default function LandingForm() {
  const router = useRouter()
  const [gender, setGender] = useState<Gender | null>(null)
  const [filterGender, setFilterGender] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const canStart = gender !== null && agreed && !loading

  async function handleStart() {
    if (!canStart || !gender) return
    setLoading(true)

    const userId = getOrCreateAnonId()
    const filter = filterGender ? (gender === 'male' ? 'female' : 'male') : null

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
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 gap-8">
      <h1 className="text-4xl font-bold text-center">ChatAnon</h1>
      <p className="text-gray-400 text-center max-w-sm">
        Chat with strangers for free. No sign-up needed.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <p className="text-sm text-gray-400 text-center">I am a...</p>
        <button
          onClick={() => setGender('male')}
          style={{ minHeight: 44 }}
          className={`w-full rounded-xl py-3 font-semibold transition-colors ${
            gender === 'male' ? 'bg-[#7c3aed] text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
          }`}
        >Male</button>
        <button
          onClick={() => setGender('female')}
          style={{ minHeight: 44 }}
          className={`w-full rounded-xl py-3 font-semibold transition-colors ${
            gender === 'female' ? 'bg-[#7c3aed] text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
          }`}
        >Female</button>
      </div>

      {gender && (
        <label className="flex items-center gap-3 cursor-pointer" style={{ minHeight: 44 }}>
          <input type="checkbox" checked={filterGender} onChange={e => setFilterGender(e.target.checked)} className="w-5 h-5 accent-[#7c3aed]" />
          <span className="text-gray-300 text-sm">Only match with {gender === 'male' ? 'females' : 'males'}</span>
        </label>
      )}

      <label className="flex items-start gap-3 cursor-pointer max-w-xs" style={{ minHeight: 44 }}>
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-5 h-5 mt-0.5 accent-[#7c3aed] flex-shrink-0" />
        <span className="text-gray-400 text-sm">
          I am 18 or older and agree to the{' '}
          <a href="/tos" target="_blank" rel="noopener noreferrer" className="text-[#7c3aed] underline">Terms of Service</a>
        </span>
      </label>

      <button
        onClick={handleStart}
        disabled={!canStart}
        style={{ minHeight: 44 }}
        className={`w-full max-w-xs rounded-xl py-3 font-bold text-lg transition-colors ${
          canStart ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' : 'bg-[#2a2a2a] text-gray-600 cursor-not-allowed'
        }`}
      >
        {loading ? 'Connecting...' : 'Start Chatting'}
      </button>
    </div>
  )
}
