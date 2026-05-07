import { useState, KeyboardEvent } from 'react'
import { useTheme } from '@/lib/theme-context'

interface Props {
  onSend: (text: string) => void
  onTyping: () => void
  disabled: boolean
}

export default function MessageInput({ onSend, onTyping, disabled }: Props) {
  const [text, setText] = useState('')
  const { theme } = useTheme()

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

  const sendable = !disabled && !!text.trim()

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', padding: '12px 16px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <textarea
        value={text}
        onChange={e => { setText(e.target.value); onTyping() }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Partner has left...' : 'Type a message...'}
        rows={1}
        style={{
          flex: 1,
          background: theme.inputBg,
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
          borderRadius: 16,
          padding: '12px 16px',
          fontSize: 15,
          resize: 'none',
          outline: 'none',
          minHeight: 50,
          maxHeight: 120,
          fontFamily: 'system-ui, sans-serif',
        }}
      />
      <button
        onClick={handleSend}
        disabled={!sendable}
        style={{
          background: sendable ? '#7c3aed' : theme.surface2,
          color: sendable ? '#fff' : theme.textSecondary,
          border: 'none',
          borderRadius: 16,
          padding: '0 22px',
          height: 50,
          fontSize: 15,
          fontWeight: 700,
          cursor: sendable ? 'pointer' : 'not-allowed',
          flexShrink: 0,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Send
      </button>
    </div>
  )
}
