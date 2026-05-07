// Use Node's built-in randomUUID — works in Node (tests), Vercel Edge, and browsers via Next.js
import { randomUUID } from 'crypto'

const STORAGE_KEY = 'anon_id'

// Only call this from React components/hooks (where localStorage is available)
export function getOrCreateAnonId(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const id = randomUUID()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}
