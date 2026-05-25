import { test, expect } from '@playwright/test'

const API = 'http://localhost:3001/api'

test.describe('AuthzMapper E2E', () => {
  test('health check returns OK', async () => {
    const res = await fetch(`${API}/health`)
    expect(res.ok).toBeTruthy()
    const data = await res.json()
    expect(data.status).toBe('ok')
  })

  test('import demo spec and verify endpoints', async () => {
    // Get demo spec
    const demoRes = await fetch(`${API}/demo/openapi.json`)
    const demoSpec = await demoRes.json()

    // Import the spec
    const importRes = await fetch(`${API}/specs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: JSON.stringify(demoSpec), format: 'json' }),
    })
    expect(importRes.ok).toBeTruthy()
    const importData = await importRes.json()
    expect(importData.spec.name).toBe('Demo Vulnerable API')
    expect(importData.endpoints.length).toBeGreaterThan(0)

    // Verify spec list
    const specsRes = await fetch(`${API}/specs`)
    const specs = await specsRes.json()
    expect(specs.length).toBeGreaterThan(0)
  })

  test('run scan and detect BOLA and BFLA findings', async () => {
    // Get demo spec
    const demoRes = await fetch(`${API}/demo/openapi.json`)
    const demoSpec = await demoRes.json()

    // Import
    const importRes = await fetch(`${API}/specs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: JSON.stringify(demoSpec), format: 'json' }),
    })
    const importData = await importRes.json()
    const specId = importData.spec.id

    // Run scan
    const scanRes = await fetch(`${API}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specId, name: 'E2E Scan', targetUrl: 'http://localhost:3001' }),
    })
    expect(scanRes.ok).toBeTruthy()
    const scanData = await scanRes.json()

    expect(scanData.scan.status).toBe('completed')
    expect(scanData.findings.length).toBeGreaterThan(0)

    // Verify at least one BOLA and one BFLA finding
    const bolaFindings = scanData.findings.filter((f: any) => f.type === 'bola')
    const bflaFindings = scanData.findings.filter((f: any) => f.type === 'bfla')
    expect(bolaFindings.length).toBeGreaterThan(0)
    expect(bflaFindings.length).toBeGreaterThan(0)
  })

  test('regression: fixes resolve findings', async () => {
    // Enable both fixes
    await fetch(`${API}/demo/fix/bola`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixed: true }),
    })
    await fetch(`${API}/demo/fix/bfla`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixed: true }),
    })

    // Get demo spec
    const demoRes = await fetch(`${API}/demo/openapi.json`)
    const demoSpec = await demoRes.json()

    // Import
    const importRes = await fetch(`${API}/specs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: JSON.stringify(demoSpec), format: 'json' }),
    })
    const importData = await importRes.json()
    const specId = importData.spec.id

    // Run scan
    const scanRes = await fetch(`${API}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specId, name: 'Regression Scan', targetUrl: 'http://localhost:3001' }),
    })
    const scanData = await scanRes.json()

    // After fixes, no BOLA or BFLA findings should remain
    const bolaFindings = scanData.findings.filter((f: any) => f.type === 'bola')
    const bflaFindings = scanData.findings.filter((f: any) => f.type === 'bfla')
    expect(bolaFindings.length).toBe(0)
    expect(bflaFindings.length).toBe(0)
  })

  test('frontend dashboard renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=AuthzMapper')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('frontend spec import page loads', async ({ page }) => {
    await page.goto('/specs')
    await expect(page.locator('text=Import OpenAPI Spec')).toBeVisible()
    await expect(page.locator('text=Import Demo API Spec')).toBeVisible()
  })
})
