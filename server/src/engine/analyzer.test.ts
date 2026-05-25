import { describe, it, expect } from 'vitest'
import { analyzeResults } from './analyzer.js'
import { TestResult } from '../types/index.js'

describe('analyzeResults', () => {
  it('flags BOLA findings', () => {
    const results: TestResult[] = [
      {
        endpointId: 1, roleId: 2, method: 'GET', path: '/api/users/2',
        requestUrl: '', requestHeaders: '{}', requestBody: null,
        responseStatus: 200, responseHeaders: '{}', responseBody: null,
        expectedStatus: 403, isFinding: true, findingType: 'bola',
        findingDesc: 'user_a accessed user_b resource', durationMs: 50,
      },
    ]

    const findings = analyzeResults(results, 1)
    expect(findings).toHaveLength(1)
    expect(findings[0].type).toBe('bola')
    expect(findings[0].severity).toBe('high')
    expect(findings[0].remediation).toContain('object ownership')
  })

  it('flags BFLA findings', () => {
    const results: TestResult[] = [
      {
        endpointId: 2, roleId: 2, method: 'GET', path: '/api/admin/users',
        requestUrl: '', requestHeaders: '{}', requestBody: null,
        responseStatus: 200, responseHeaders: '{}', responseBody: null,
        expectedStatus: 403, isFinding: true, findingType: 'bfla',
        findingDesc: 'user_a accessed admin endpoint', durationMs: 50,
      },
    ]

    const findings = analyzeResults(results, 1)
    expect(findings).toHaveLength(1)
    expect(findings[0].type).toBe('bfla')
    expect(findings[0].severity).toBe('high')
    expect(findings[0].remediation).toContain('role-based access control')
  })

  it('returns empty array for clean results', () => {
    const results: TestResult[] = [
      {
        endpointId: 1, roleId: 1, method: 'GET', path: '/api/health',
        requestUrl: '', requestHeaders: '{}', requestBody: null,
        responseStatus: 200, responseHeaders: '{}', responseBody: null,
        expectedStatus: 200, isFinding: false, findingType: null,
        findingDesc: null, durationMs: 10,
      },
    ]

    const findings = analyzeResults(results, 1)
    expect(findings).toHaveLength(0)
  })
})
