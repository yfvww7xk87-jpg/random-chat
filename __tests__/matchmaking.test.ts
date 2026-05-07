import { isCompatible, validateGender, validateFilter } from '../lib/matchmaking'

describe('isCompatible', () => {
  it('matches when both have no filter', () => {
    expect(isCompatible({ gender: 'male', filter: null }, { gender: 'female', filter: null })).toBe(true)
  })
  it('matches same-gender when both have no filter', () => {
    expect(isCompatible({ gender: 'male', filter: null }, { gender: 'male', filter: null })).toBe(true)
  })
  it('matches when filters are mutually satisfied', () => {
    expect(isCompatible({ gender: 'male', filter: 'female' }, { gender: 'female', filter: 'male' })).toBe(true)
  })
  it('does not match when A wants female but B is male', () => {
    expect(isCompatible({ gender: 'male', filter: 'female' }, { gender: 'male', filter: null })).toBe(false)
  })
  it('does not match when B wants male but A is female', () => {
    expect(isCompatible({ gender: 'female', filter: null }, { gender: 'female', filter: 'male' })).toBe(false)
  })
  it('matches when one has a filter and the other does not', () => {
    expect(isCompatible({ gender: 'male', filter: 'female' }, { gender: 'female', filter: null })).toBe(true)
  })
})

describe('validateGender', () => {
  it('accepts male and female', () => {
    expect(validateGender('male')).toBe(true)
    expect(validateGender('female')).toBe(true)
  })
  it('rejects anything else', () => {
    expect(validateGender('other')).toBe(false)
    expect(validateGender('')).toBe(false)
    expect(validateGender(null)).toBe(false)
  })
})

describe('validateFilter', () => {
  it('accepts male, female, and null', () => {
    expect(validateFilter('male')).toBe(true)
    expect(validateFilter('female')).toBe(true)
    expect(validateFilter(null)).toBe(true)
    expect(validateFilter(undefined)).toBe(true)
  })
  it('rejects anything else', () => {
    expect(validateFilter('other')).toBe(false)
    expect(validateFilter('')).toBe(false)
  })
})
