export function redactValue(value: string): string {
  if (value.length <= 8) return '****'
  return value.substring(0, 4) + '...' + value.substring(value.length - 4)
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'high': return 'text-red-400 bg-red-900/30'
    case 'medium': return 'text-yellow-400 bg-yellow-900/30'
    case 'low': return 'text-blue-400 bg-blue-900/30'
    default: return 'text-gray-400 bg-gray-800'
  }
}

export function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET': return 'text-green-400'
    case 'POST': return 'text-blue-400'
    case 'PUT': return 'text-orange-400'
    case 'PATCH': return 'text-yellow-400'
    case 'DELETE': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
