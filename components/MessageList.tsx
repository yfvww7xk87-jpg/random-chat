import { useEffect, useRef } from 'react'

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
      {messages.length === 0 && (
        <p className="text-center text-gray-500 text-sm mt-8">You are now connected. Say hi!</p>
      )}
      {messages.map(msg => {
        const isMine = msg.senderId === myUserId
        return (
          <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
              isMine ? 'bg-[#7c3aed] text-white rounded-br-sm' : 'bg-[#2a2a2a] text-gray-200 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
