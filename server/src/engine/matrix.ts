import { TestCase, ParsedEndpoint, RoleData, TokenData } from '../types/index.js'

export function generateMatrix(
  endpoints: (ParsedEndpoint & { id: number })[],
  roles: RoleData[],
  tokens: TokenData[],
  _targetUrl: string,
  _specId: number,
): TestCase[] {
  const testCases: TestCase[] = []

  for (const endpoint of endpoints) {
    for (const role of roles) {
      const token = tokens.find(t => t.roleId === role.id)
      const headers: Record<string, string> = {}

      if (token) {
        if (token.type === 'bearer') {
          headers['Authorization'] = `Bearer ${token.value}`
        } else if (token.type === 'header' && token.headerName) {
          headers[token.headerName] = token.value
        }
      }

      let expectedStatus = 200
      let objectOwner: string | null = null
      let objectId: string | null = null

      if (role.name === 'anonymous' && endpoint.authRequired) {
        expectedStatus = 401
      }

      if (endpoint.objectIdParam) {
        objectOwner = role.name
        objectId = role.name === 'user_a' ? '1' : role.name === 'user_b' ? '2' : '1'

        if (role.name === 'user_a') {
          const bolaCase: TestCase = {
            endpointId: endpoint.id,
            method: endpoint.method,
            path: endpoint.path.replace(`{${endpoint.objectIdParam}}`, '2'),
            roleId: role.id,
            roleName: role.name,
            objectOwner: 'user_b',
            objectId: '2',
            expectedStatus: 403,
            headers: { ...headers },
          }
          testCases.push(bolaCase)
          continue
        }
      }

      if (endpoint.path.includes('/admin') && role.name !== 'admin') {
        expectedStatus = 403
      }

      let resolvedPath = endpoint.path
      if (endpoint.objectIdParam && objectId) {
        resolvedPath = resolvedPath.replace(`{${endpoint.objectIdParam}}`, objectId)
      }
      resolvedPath = resolvedPath.replace(/\{(\w+)\}/g, '1')

      testCases.push({
        endpointId: endpoint.id,
        method: endpoint.method,
        path: resolvedPath,
        roleId: role.id,
        roleName: role.name,
        objectOwner,
        objectId,
        expectedStatus,
        headers: { ...headers },
      })
    }
  }

  return testCases
}
