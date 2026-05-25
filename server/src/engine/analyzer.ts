import { TestResult, FindingData, REMEDIATIONS } from '../types/index.js'

export function analyzeResults(results: TestResult[], scanId: number): FindingData[] {
  const findings: FindingData[] = []

  for (const result of results) {
    if (!result.isFinding) continue

    const findingType = result.findingType || 'unknown'
    const severity = findingType === 'bola' || findingType === 'bfla' ? 'high' :
                     findingType === 'auth_error' ? 'medium' : 'low'

    const finding: FindingData = {
      scanId,
      resultId: 0,
      type: findingType,
      severity,
      endpoint: `${result.method} ${result.path}`,
      description: result.findingDesc || `Unexpected response: got ${result.responseStatus}, expected ${result.expectedStatus}`,
      remediation: REMEDIATIONS[findingType] || 'Review authorization logic for this endpoint.',
    }

    findings.push(finding)
  }

  return findings
}
