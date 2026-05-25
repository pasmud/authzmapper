import { describe, it, expect } from 'vitest'
import { parseSpec } from './parser.js'

describe('parseSpec', () => {
  it('parses a basic OpenAPI JSON spec', () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users/{id}': {
          get: {
            summary: 'Get user',
            operationId: 'getUser',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            responses: { '200': { description: 'OK' } },
          },
        },
        '/admin/users': {
          get: {
            summary: 'List users (admin)',
            operationId: 'listUsers',
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    })

    const result = parseSpec(spec, 'json')
    expect(result.name).toBe('Test API')
    expect(result.version).toBe('1.0.0')
    expect(result.endpoints).toHaveLength(2)
    expect(result.endpoints[0].path).toBe('/users/{id}')
    expect(result.endpoints[0].method).toBe('GET')
    expect(result.endpoints[0].objectIdParam).toBe('id')
    expect(result.endpoints[1].path).toBe('/admin/users')
    expect(result.endpoints[1].objectIdParam).toBeNull()
  })

  it('parses auth schemes', () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Auth API', version: '2.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
          apiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
        },
      },
      paths: {
        '/data': {
          get: {
            summary: 'Get data',
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    })

    const result = parseSpec(spec, 'json')
    expect(result.authSchemes).toHaveLength(2)
    expect(result.authSchemes[0].name).toBe('bearerAuth')
    expect(result.authSchemes[0].type).toBe('http')
    expect(result.authSchemes[1].name).toBe('apiKey')
    expect(result.authSchemes[1].inHeader).toBe('header')
  })

  it('parses YAML spec', () => {
    const yaml = `openapi: "3.0.3"
info:
  title: YAML API
  version: "1.0.0"
paths:
  /items:
    get:
      summary: List items
      responses:
        "200":
          description: OK
`
    const result = parseSpec(yaml, 'yaml')
    expect(result.name).toBe('YAML API')
    expect(result.endpoints).toHaveLength(1)
    expect(result.endpoints[0].path).toBe('/items')
  })

  it('handles empty paths', () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Empty API', version: '1.0.0' },
      paths: {},
    })
    const result = parseSpec(spec, 'json')
    expect(result.endpoints).toHaveLength(0)
  })
})
