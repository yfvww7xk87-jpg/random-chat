'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface Theme {
  bg: string
  surface: string
  surface2: string
  border: string
  textPrimary: string
  textSecondary: string
  strangerBubble: string
  strangerBubbleBorder: string
  strangerText: string
  inputBg: string
  isDark: boolean
}

const dark: Theme = {
  bg: '#111111',
  surface: '#1c1c1c',
  surface2: '#252525',
  border: '#2e2e2e',
  textPrimary: '#f5f5f5',
  textSecondary: '#888',
  strangerBubble: '#252525',
  strangerBubbleBorder: '#383838',
  strangerText: '#e5e5e5',
  inputBg: '#252525',
  isDark: true,
}

const light: Theme = {
  bg: '#f0f0f0',
  surface: '#ffffff',
  surface2: '#e8e8e8',
  border: '#dedede',
  textPrimary: '#111111',
  textSecondary: '#666',
  strangerBubble: '#e4e4e4',
  strangerBubbleBorder: '#d0d0d0',
  strangerText: '#111111',
  inputBg: '#ffffff',
  isDark: false,
}

interface ThemeCtx {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeCtx>({ theme: dark, toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    setIsDark(stored === 'light' ? false : true)
  }, [])

  if (isDark === null) return <>{children}</>

  function toggle() {
    setIsDark(prev => {
      localStorage.setItem('theme', prev ? 'light' : 'dark')
      return !prev
    })
  }

  return (
    <ThemeContext.Provider value={{ theme: isDark ? dark : light, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
