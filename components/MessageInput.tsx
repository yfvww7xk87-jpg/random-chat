import { useState, KeyboardEvent } from 'react'

interface Props {
  onSend: (text: string) => void
  disabled: boolean
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="flex gap-2 items-end px-4 py-3 bg-[#0f0f0f] border-t border-[#2a2a2a]"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Partner has left...' : 'Type a message...'}
        rows={1}
        className="flex-1 bg-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm resize-none outline-none placeholder-gray-500 disabled:opacity-50"
        style={{ minHeight: 44, maxHeight: 120 }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        style={{ minHeight: 44, minWidth: 44 }}
        className="bg-[#7c3aed] text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-[#6d28d9] transition-colors"
      >
        Send
      </button>
    </div>
  )
}
