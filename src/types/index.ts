export interface Spec {
  id: number
  name: string
  version: string
  format: string
  sourceUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Endpoint {
  id: number
  specId: number
  path: string
  method: string
  summary: string | null
  operationId: string | null
  authRequired: number
  objectIdParam: string | null
}

export interface AuthScheme {
  id: number
  specId: number
  type: string
  name: string
  inHeader: string | null
}

export interface Role {
  id: number
  name: string
  description: string | null
  tokens?: Token[]
}

export interface Token {
  id: number
  roleId: number
  type: string
  value: string
  headerName: string | null
}

export interface Scan {
  id: number
  specId: number
  name: string
  status: string
  targetUrl: string
  totalTests: number
  passedTests: number
  failedTests: number
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export interface ScanResult {
  id: number
  scanId: number
  endpointId: number
  roleId: number
  method: string
  path: string
  requestUrl: string
  requestHeaders: string
  requestBody: string | null
  responseStatus: number
  responseHeaders: string
  responseBody: string | null
  expectedStatus: number
  isFinding: number
  findingType: string | null
  findingDesc: string | null
  durationMs: number
}

export interface Finding {
  id: number
  scanId: number
  resultId: number
  type: string
  severity: string
  endpoint: string
  description: string
  remediation: string
  isFixed: number
  createdAt: string
}
