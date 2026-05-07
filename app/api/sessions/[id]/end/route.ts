import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { serverBroadcast } from '@/lib/supabase/broadcast'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: sessionId } = params
  const body = await req.json().catch(() => null)
  const userId = body?.userId

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('id, user_a, user_b, status')
    .eq('id', sessionId)
    .single()

  if (fetchError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.user_a !== userId && session.user_b !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (session.status === 'ended') {
    return NextResponse.json({ status: 'already_ended' })
  }

  const { error: updateError } = await supabase
    .from('sessions')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (updateError) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  await serverBroadcast(`chat:${sessionId}`, 'partner_left', {})

  return NextResponse.json({ status: 'ended' })
}
