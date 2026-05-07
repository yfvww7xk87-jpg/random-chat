import { getOrCreateAnonId } from '../lib/anon-id'

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('getOrCreateAnonId', () => {
  beforeEach(() => localStorageMock.clear())

  it('generates a UUID on first call', () => {
    const id = getOrCreateAnonId()
    expect(id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('returns the same ID on subsequent calls', () => {
    const id1 = getOrCreateAnonId()
    const id2 = getOrCreateAnonId()
    expect(id1).toBe(id2)
  })

  it('returns a different ID for a fresh localStorage', () => {
    const id1 = getOrCreateAnonId()
    localStorageMock.clear()
    const id2 = getOrCreateAnonId()
    expect(id1).not.toBe(id2)
  })
})
