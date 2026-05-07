import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const userId = body?.userId

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const supabase = createServerClient()
  await supabase.from('queue').delete().eq('user_id', userId)

  return NextResponse.json({ status: 'removed' })
}
