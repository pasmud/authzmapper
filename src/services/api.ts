const BASE_URL = '/api'

async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }
  return response.json()
}

export const api = {
  health: () => fetchJson('/health'),

  // Specs
  getSpecs: () => fetchJson('/specs'),
  getSpec: (id: number) => fetchJson(`/specs/${id}`),
  createSpec: (raw: string, format: string, sourceUrl?: string) =>
    fetchJson('/specs', { method: 'POST', body: JSON.stringify({ raw, format, sourceUrl }) }),
  deleteSpec: (id: number) =>
    fetchJson(`/specs/${id}`, { method: 'DELETE' }),

  // Roles
  getRoles: () => fetchJson('/roles'),
  setToken: (roleId: number, type: string, value: string, headerName?: string) =>
    fetchJson(`/roles/${roleId}/token`, { method: 'PUT', body: JSON.stringify({ type, value, headerName }) }),
  deleteToken: (roleId: number) =>
    fetchJson(`/roles/${roleId}/token`, { method: 'DELETE' }),

  // Scans
  getScans: () => fetchJson('/scans'),
  getScan: (id: number) => fetchJson(`/scans/${id}`),
  createScan: (specId: number, name: string, targetUrl: string) =>
    fetchJson('/scans', { method: 'POST', body: JSON.stringify({ specId, name, targetUrl }) }),
  fixFinding: (scanId: number, findingId: number, isFixed: boolean) =>
    fetchJson(`/scans/${scanId}/findings/${findingId}/fix`, { method: 'PUT', body: JSON.stringify({ isFixed }) }),

  // Reports
  getMarkdownReport: (scanId: number) =>
    fetch(`${BASE_URL}/reports/${scanId}/markdown`).then(r => r.text()),
  getJsonReport: (scanId: number) =>
    fetchJson(`/reports/${scanId}/json`),

  // Demo
  getDemoSpec: () => fetchJson('/demo/openapi.json'),
  toggleBolaFix: (fixed: boolean) =>
    fetchJson('/demo/fix/bola', { method: 'POST', body: JSON.stringify({ fixed }) }),
  toggleBflaFix: (fixed: boolean) =>
    fetchJson('/demo/fix/bfla', { method: 'POST', body: JSON.stringify({ fixed }) }),
}
