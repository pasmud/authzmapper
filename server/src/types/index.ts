export interface OpenApiSpec {
  openapi: string
  info: {
    title: string
    version: string
  }
  paths: Record<string, Record<string, OpenApiPathItem>>
  components?: {
    securitySchemes?: Record<string, OpenApiSecurityScheme>
  }
  servers?: Array<{ url: string }>
}

export interface OpenApiPathItem {
  summary?: string
  operationId?: string
  parameters?: Array<{
    name: string
    in: string
    required?: boolean
    schema?: { type: string }
  }>
  security?: Array<Record<string, string[]>>
  responses?: Record<string, any>
  requestBody?: any
}

export interface OpenApiSecurityScheme {
  type: string
  name?: string
  in?: string
  scheme?: string
  bearerFormat?: string
}

export interface ParsedSpec {
  id?: number
  name: string
  version: string
  raw: string
  format: string
  sourceUrl: string | null
}

export interface ParsedEndpoint {
  path: string
  method: string
  summary: string | null
  operationId: string | null
  authRequired: boolean
  objectIdParam: string | null
}

export interface ParsedAuthScheme {
  type: string
  name: string
  inHeader: string | null
}

export interface RoleData {
  id: number
  name: string
  description: string | null
}

export interface TokenData {
  id: number
  roleId: number
  type: string
  value: string
  headerName: string | null
}

export interface ScanData {
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

export interface TestCase {
  endpointId: number
  method: string
  path: string
  roleId: number
  roleName: string
  objectOwner: string | null
  objectId: string | null
  expectedStatus: number
  headers: Record<string, string>
}

export interface TestResult {
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
  isFinding: boolean
  findingType: string | null
  findingDesc: string | null
  durationMs: number
}

export interface FindingData {
  scanId: number
  resultId: number
  type: string
  severity: string
  endpoint: string
  description: string
  remediation: string
}

export const REMEDIATIONS: Record<string, string> = {
  bola: 'Implement object ownership checks in the business logic layer. Validate that the authenticated user has access to the requested resource before returning data. Use parameterized queries with user context filters (e.g., `WHERE user_id = current_user.id`). Avoid exposing sequential/internal IDs in URLs.',
  bfla: 'Implement role-based access control (RBAC) middleware on all admin/high-privilege endpoints. Adopt a "deny by default" approach. Use declarative role/permission annotations on route handlers. Ensure that authorization checks run before any business logic.',
}
