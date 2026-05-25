const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'api-key',
  'token',
]

export function redactValue(value: string): string {
  if (value.length <= 8) return '****'
  return value.substring(0, 4) + '...' + value.substring(value.length - 4)
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      redacted[key] = redactValue(value)
    } else {
      redacted[key] = value
    }
  }
  return redacted
}
