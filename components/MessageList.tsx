import { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/theme-context'

interface Message {
  id: string
  text: string
  senderId: string
  sentAt: string
}

interface Props {
  messages: Message[]
  myUserId: string
}

export default function MessageList({ messages, myUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16, background: theme.bg }}>
      {messages.length === 0 && (
        <p style={{ textAlign: 'center', color: theme.textSecondary, fontSize: 14, marginTop: 40 }}>You are now connected. Say hi!</p>
      )}
      {messages.map(msg => {
        const isMine = msg.senderId === myUserId
        return (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: isMine ? 'flex-end' : 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: isMine ? '#a78bfa' : theme.textSecondary, paddingLeft: 4, paddingRight: 4 }}>
              {isMine ? 'You' : 'Stranger'}
            </span>
            <div style={{
              maxWidth: '72%',
              padding: '10px 14px',
              borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: isMine ? '#7c3aed' : theme.strangerBubble,
              color: isMine ? '#fff' : theme.strangerText,
              fontSize: 15,
              lineHeight: 1.5,
              wordBreak: 'break-word',
              border: isMine ? 'none' : `1px solid ${theme.strangerBubbleBorder}`,
            }}>
              {msg.text}
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
