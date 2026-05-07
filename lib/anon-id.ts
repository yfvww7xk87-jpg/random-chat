const STORAGE_KEY = 'anon_id'
const PREFS_KEY = 'chat_prefs'

// Only call this from React components/hooks (where localStorage is available)
export function getOrCreateAnonId(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}

export function saveChatPrefs(gender: string, filter: string | null) {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ gender, filter }))
}

export function loadChatPrefs(): { gender: string; filter: string | null } | null {
  const raw = localStorage.getItem(PREFS_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}
