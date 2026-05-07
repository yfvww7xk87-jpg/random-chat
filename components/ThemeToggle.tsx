'use client'

import { useTheme } from '@/lib/theme-context'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: theme.surface2,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: '6px 12px',
        cursor: 'pointer',
        fontSize: 16,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: theme.textSecondary,
      }}
    >
      {theme.isDark ? '☀️' : '🌙'}
    </button>
  )
}
