import { describe, it, expect } from 'vitest'
import { detectLocale } from './LocaleContext'

describe('detectLocale', () => {
  it('returns "ar" when navigator.language starts with "ar"', () => {
    expect(detectLocale('ar-SA', null)).toBe('ar')
    expect(detectLocale('ar', null)).toBe('ar')
  })
  it('returns "en" for any non-Arabic navigator.language', () => {
    expect(detectLocale('en-US', null)).toBe('en')
    expect(detectLocale('fr-FR', null)).toBe('en')
  })
  it('prefers stored locale over navigator.language', () => {
    expect(detectLocale('en-US', 'ar')).toBe('ar')
    expect(detectLocale('ar-SA', 'en')).toBe('en')
  })
  it('falls back to "ar" when navigator.language is null and no stored locale', () => {
    expect(detectLocale(null, null)).toBe('ar')
  })
})
