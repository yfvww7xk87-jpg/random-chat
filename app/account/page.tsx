'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 gap-6">
      <h1 className="text-2xl font-bold">{mode === 'login' ? 'Log in' : 'Create account'}</h1>
      <p className="text-gray-400 text-sm text-center max-w-xs">An account is optional — you can chat without one.</p>

      <div className="w-full max-w-xs space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
          className="w-full bg-[#2a2a2a] text-white rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-500"
          style={{ minHeight: 44 }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
          className="w-full bg-[#2a2a2a] text-white rounded-xl px-4 py-3 text-sm outline-none placeholder-gray-500"
          style={{ minHeight: 44 }} />

        {message && <p className="text-sm text-center text-gray-400">{message}</p>}

        <button onClick={handleSubmit} disabled={loading || !email || !password}
          className="w-full bg-[#7c3aed] text-white rounded-xl py-3 font-semibold disabled:opacity-40 hover:bg-[#6d28d9] transition-colors"
          style={{ minHeight: 44 }}>
          {loading ? '...' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full text-gray-500 text-sm hover:text-gray-300 transition-colors py-2">
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>

        <button onClick={() => router.push('/')}
          className="w-full text-gray-600 text-sm hover:text-gray-400 transition-colors py-2">
          Skip — chat without account
        </button>
      </div>
    </div>
  )
}
