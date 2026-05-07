type Gender = 'male' | 'female'

interface UserProfile {
  gender: Gender
  filter: Gender | null
}

export function isCompatible(a: UserProfile, b: UserProfile): boolean {
  const aWantsB = a.filter === null || a.filter === b.gender
  const bWantsA = b.filter === null || b.filter === a.gender
  return aWantsB && bWantsA
}

export function validateGender(value: unknown): value is Gender {
  return value === 'male' || value === 'female'
}

export function validateFilter(value: unknown): value is Gender | null | undefined {
  return value === 'male' || value === 'female' || value === null || value === undefined
}
