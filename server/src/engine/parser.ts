import yaml from 'js-yaml'
import { OpenApiSpec, OpenApiPathItem, ParsedEndpoint, ParsedAuthScheme } from '../types/index.js'

export function parseSpec(raw: string, format: string): {
  name: string
  version: string
  endpoints: ParsedEndpoint[]
  authSchemes: ParsedAuthScheme[]
} {
  const spec: OpenApiSpec = format === 'yaml' ? yaml.load(raw) as OpenApiSpec : JSON.parse(raw)

  const name = spec.info?.title || 'Untitled API'
  const version = spec.info?.version || '1.0.0'

  const endpoints: ParsedEndpoint[] = []
  const authSchemes: ParsedAuthScheme[] = []

  // Parse auth schemes
  if (spec.components?.securitySchemes) {
    for (const [key, scheme] of Object.entries(spec.components.securitySchemes)) {
      authSchemes.push({
        type: scheme.type || 'bearer',
        name: key,
        inHeader: scheme.in || (scheme.type === 'apiKey' ? 'header' : null),
      })
    }
  }

  // Parse paths
  if (spec.paths) {
    for (const [path, methods] of Object.entries(spec.paths)) {
      const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']
      for (const method of httpMethods) {
        const op: OpenApiPathItem | undefined = (methods as any)[method]
        if (!op) continue

        // Find object ID parameter
        let objectIdParam: string | null = null
        if (op.parameters) {
          for (const param of op.parameters) {
            if (
              param.in === 'path' &&
              (param.name.toLowerCase().includes('id') ||
               param.name.toLowerCase().includes('key') ||
               param.name.toLowerCase().includes('uuid'))
            ) {
              objectIdParam = param.name
              break
            }
          }
        }

        // Check if auth is required
        const authRequired = !!(op.security && op.security.length > 0)

        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: op.summary || null,
          operationId: op.operationId || null,
          authRequired,
          objectIdParam,
        })
      }
    }
  }

  return { name, version, endpoints, authSchemes }
}
