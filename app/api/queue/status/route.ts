import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const supabase = createServerClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('id')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (session) {
    return NextResponse.json({ status: 'matched', sessionId: session.id })
  }

  return NextResponse.json({ status: 'waiting' })
}
