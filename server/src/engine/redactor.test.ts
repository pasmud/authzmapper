import { describe, it, expect } from 'vitest'
import { redactValue, redactHeaders } from './redactor.js'

describe('redactValue', () => {
  it('redacts long values showing first and last 4 chars', () => {
    const result = redactValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
    expect(result).toHaveLength(11)
    expect(result.startsWith('eyJh')).toBe(true)
    expect(result.endsWith('VCJ9')).toBe(true)
  })

  it('returns **** for short values', () => {
    expect(redactValue('short')).toBe('****')
  })

  it('handles empty string', () => {
    expect(redactValue('')).toBe('****')
  })
})

describe('redactHeaders', () => {
  it('redacts Authorization header', () => {
    const headers = { Authorization: 'Bearer secret12345' }
    const result = redactHeaders(headers)
    expect(result.Authorization).not.toBe('Bearer secret12345')
    expect(result.Authorization).toContain('...')
  })

  it('redacts Cookie header', () => {
    const headers = { Cookie: 'session=abc123' }
    const result = redactHeaders(headers)
    expect(result.Cookie).toContain('...')
  })

  it('redacts X-API-Key header', () => {
    const headers = { 'X-API-Key': 'my-secret-key-12345' }
    const result = redactHeaders(headers)
    expect(result['X-API-Key']).toContain('...')
  })

  it('does not redact non-sensitive headers', () => {
    const headers = { 'Content-Type': 'application/json' }
    const result = redactHeaders(headers)
    expect(result['Content-Type']).toBe('application/json')
  })
})
