import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ChatRoom from '@/components/ChatRoom'

interface Props {
  searchParams: Promise<{ session?: string }>
}

export default async function ChatPage({ searchParams }: Props) {
  const params = await searchParams
  const sessionId = params.session
  if (!sessionId) redirect('/')

  const supabase = createServerClient()

  const { data: session, error } = await supabase
    .from('sessions')
    .select('id, user_a, user_b, status')
    .eq('id', sessionId)
    .eq('status', 'active')
    .single()

  if (error || !session) redirect('/')

  return (
    <ChatRoom
      sessionId={session.id}
      userA={session.user_a}
      userB={session.user_b}
    />
  )
}
