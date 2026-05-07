import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { serverBroadcast } from '@/lib/supabase/broadcast'
import { validateGender, validateFilter } from '@/lib/matchmaking'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { userId, gender, filter } = body

  if (typeof userId !== 'string' || userId.trim() === '')
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  if (!validateGender(gender))
    return NextResponse.json({ error: 'Invalid gender' }, { status: 400 })
  if (!validateFilter(filter))
    return NextResponse.json({ error: 'Invalid filter' }, { status: 400 })

  const supabase = createServerClient()

  const { data, error } = await supabase.rpc('find_or_join_queue', {
    p_user_id: userId,
    p_gender: gender,
    p_filter: filter ?? null,
  })

  if (error) {
    console.error('Matchmaking error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  if (data.status === 'matched') {
    await serverBroadcast(`queue:${data.partner_id}`, 'matched', {
      sessionId: data.session_id,
    })
    return NextResponse.json({
      status: 'matched',
      sessionId: data.session_id,
      partnerId: data.partner_id,
    })
  }

  return NextResponse.json({ status: 'waiting' })
}
