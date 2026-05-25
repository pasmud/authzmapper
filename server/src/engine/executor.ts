import { TestCase, TestResult } from '../types/index.js'
import { redactHeaders } from './redactor.js'

const TIMEOUT_MS = 30000

export async function executeTest(testCase: TestCase, targetUrl: string): Promise<TestResult> {
  const url = `${targetUrl}${testCase.path}`.replace(/([^:])\/\//, '$1/')
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(url, {
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json',
        ...testCase.headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const durationMs = Date.now() - startTime
    const responseBody = await response.text()

    const result: TestResult = {
      endpointId: testCase.endpointId,
      roleId: testCase.roleId,
      method: testCase.method,
      path: testCase.path,
      requestUrl: url,
      requestHeaders: JSON.stringify(redactHeaders(testCase.headers)),
      requestBody: null,
      responseStatus: response.status,
      responseHeaders: JSON.stringify(redactHeaders(Object.fromEntries(response.headers.entries()))),
      responseBody: responseBody.length > 10000 ? responseBody.substring(0, 10000) + '... [truncated]' : responseBody,
      expectedStatus: testCase.expectedStatus,
      isFinding: false,
      findingType: null,
      findingDesc: null,
      durationMs,
    }

    // Determine if this is a finding
    if (testCase.expectedStatus === 401 || testCase.expectedStatus === 403) {
      if (response.status === 200) {
        result.isFinding = true
        if (testCase.path.includes('/admin')) {
          result.findingType = 'bfla'
          result.findingDesc = `${testCase.roleName} accessed admin endpoint ${testCase.method} ${testCase.path} and received 200 instead of ${testCase.expectedStatus}`
        } else {
          result.findingType = 'bola'
          result.findingDesc = `${testCase.roleName} accessed ${testCase.objectOwner}'s resource at ${testCase.method} ${testCase.path} and received 200 instead of ${testCase.expectedStatus}`
        }
      }
    } else if (testCase.expectedStatus === 200 && response.status >= 400) {
      result.isFinding = true
      result.findingType = 'auth_error'
      result.findingDesc = `${testCase.roleName} expected 200 but received ${response.status} for ${testCase.method} ${testCase.path}`
    }

    return result
  } catch (err: any) {
    const durationMs = Date.now() - startTime
    return {
      endpointId: testCase.endpointId,
      roleId: testCase.roleId,
      method: testCase.method,
      path: testCase.path,
      requestUrl: `${targetUrl}${testCase.path}`,
      requestHeaders: JSON.stringify(redactHeaders(testCase.headers)),
      requestBody: null,
      responseStatus: 0,
      responseHeaders: '{}',
      responseBody: err.name === 'AbortError' ? 'Request timed out' : `Error: ${err.message}`,
      expectedStatus: testCase.expectedStatus,
      isFinding: true,
      findingType: 'error',
      findingDesc: `Request failed: ${err.message}`,
      durationMs,
    }
  }
}

export async function executeTests(
  testCases: TestCase[],
  targetUrl: string,
  onProgress?: (completed: number, total: number) => void,
): Promise<TestResult[]> {
  const results: TestResult[] = []
  const concurrency = 2

  for (let i = 0; i < testCases.length; i += concurrency) {
    const batch = testCases.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(tc => executeTest(tc, targetUrl)),
    )
    results.push(...batchResults)
    if (onProgress) {
      onProgress(results.length, testCases.length)
    }
  }

  return results
}
