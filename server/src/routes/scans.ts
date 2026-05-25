import { Router, Request, Response } from 'express'
import { getDb, saveDatabase, dbRun, dbQuery, dbGet } from '../db/index.js'
import { generateMatrix } from '../engine/matrix.js'
import { executeTests } from '../engine/executor.js'
import { analyzeResults } from '../engine/analyzer.js'
import { RoleData, TokenData, ParsedEndpoint } from '../types/index.js'

const router = Router()

router.post('/scans', async (req: Request, res: Response) => {
  try {
    const { specId, name, targetUrl } = req.body
    if (!specId || !targetUrl) {
      res.status(400).json({ error: 'specId and targetUrl are required' })
      return
    }

    const db = await getDb()
    const now = new Date().toISOString()

    dbRun(db, `INSERT INTO scans (spec_id, name, status, target_url, total_tests, passed_tests, failed_tests, started_at, created_at) VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?)`,
      [specId, name || `Scan ${now}`, 'running', targetUrl, now, now])
    const scanId = (dbGet(db, 'SELECT last_insert_rowid() as id') as any).id

    const endpoints = dbQuery(db, 'SELECT * FROM endpoints WHERE spec_id = ?', [specId]) as (ParsedEndpoint & { id: number })[]
    if (endpoints.length === 0) {
      dbRun(db, "UPDATE scans SET status = 'failed', completed_at = ? WHERE id = ?", [now, scanId])
      saveDatabase()
      res.status(400).json({ error: 'No endpoints found for this spec' })
      return
    }

    const roles = dbQuery(db, 'SELECT * FROM roles') as RoleData[]
    if (roles.length === 0) {
      dbRun(db, "UPDATE scans SET status = 'failed', completed_at = ? WHERE id = ?", [now, scanId])
      saveDatabase()
      res.status(400).json({ error: 'No roles configured. Run db:seed first.' })
      return
    }

    const allTokens = dbQuery(db, 'SELECT * FROM tokens') as TokenData[]

    for (const role of roles) {
      dbRun(db, 'INSERT INTO scan_roles (scan_id, role_id) VALUES (?, ?)', [scanId, role.id])
    }
    for (const ep of endpoints) {
      dbRun(db, 'INSERT INTO scan_endpoints (scan_id, endpoint_id) VALUES (?, ?)', [scanId, ep.id])
    }

    const testCases = generateMatrix(endpoints, roles, allTokens, targetUrl, specId)
    dbRun(db, 'UPDATE scans SET total_tests = ? WHERE id = ?', [testCases.length, scanId])

    const results = await executeTests(testCases, targetUrl)
    const findings = analyzeResults(results, scanId)

    const resultIds: number[] = []
    for (const result of results) {
      dbRun(db, `INSERT INTO scan_results (scan_id, endpoint_id, role_id, method, path, request_url, request_headers, request_body, response_status, response_headers, response_body, expected_status, is_finding, finding_type, finding_desc, duration_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [scanId, result.endpointId, result.roleId, result.method, result.path, result.requestUrl,
         result.requestHeaders, result.requestBody, result.responseStatus, result.responseHeaders,
         result.responseBody, result.expectedStatus, result.isFinding ? 1 : 0,
         result.findingType, result.findingDesc, result.durationMs, now])
      const row = dbGet(db, 'SELECT last_insert_rowid() as id')
      resultIds.push((row as any).id)
    }

    let findingIdx = 0
    for (let i = 0; i < results.length; i++) {
      if (results[i].isFinding && findingIdx < findings.length) {
        dbRun(db, `INSERT INTO scan_findings (scan_id, result_id, type, severity, endpoint, description, remediation, is_fixed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [findings[findingIdx].scanId, resultIds[i], findings[findingIdx].type, findings[findingIdx].severity,
           findings[findingIdx].endpoint, findings[findingIdx].description, findings[findingIdx].remediation, 0, now])
        findingIdx++
      }
    }

    const passedCount = results.filter(r => !r.isFinding).length
    const failedCount = results.filter(r => r.isFinding).length
    dbRun(db, "UPDATE scans SET status = 'completed', passed_tests = ?, failed_tests = ?, completed_at = ? WHERE id = ?",
      [passedCount, failedCount, now, scanId])

    saveDatabase()

    const scan = dbGet(db, 'SELECT * FROM scans WHERE id = ?', [scanId])
    const scanResults = dbQuery(db, 'SELECT * FROM scan_results WHERE scan_id = ?', [scanId])
    const scanFindings = dbQuery(db, 'SELECT * FROM scan_findings WHERE scan_id = ?', [scanId])

    res.status(201).json({ scan, results: scanResults, findings: scanFindings })
  } catch (err: any) {
    res.status(500).json({ error: `Scan failed: ${err.message}` })
  }
})

router.get('/scans', async (_req: Request, res: Response) => {
  const db = await getDb()
  const allScans = dbQuery(db, 'SELECT * FROM scans ORDER BY created_at DESC')
  res.json(allScans)
})

router.get('/scans/:id', async (req: Request, res: Response) => {
  const db = await getDb()
  const scanId = parseInt(String(req.params.id), 10)
  const scan = dbGet(db, 'SELECT * FROM scans WHERE id = ?', [scanId])
  if (!scan) {
    res.status(404).json({ error: 'Scan not found' })
    return
  }
  const results = dbQuery(db, 'SELECT * FROM scan_results WHERE scan_id = ?', [scanId])
  const findings = dbQuery(db, 'SELECT * FROM scan_findings WHERE scan_id = ?', [scanId])
  res.json({ scan, results, findings })
})

router.put('/scans/:id/findings/:findingId/fix', async (req: Request, res: Response) => {
  const db = await getDb()
  const findingId = parseInt(String(req.params.findingId), 10)
  const { isFixed } = req.body
  dbRun(db, 'UPDATE scan_findings SET is_fixed = ? WHERE id = ?', [isFixed ? 1 : 0, findingId])
  saveDatabase()
  const finding = dbGet(db, 'SELECT * FROM scan_findings WHERE id = ?', [findingId])
  res.json(finding)
})

export default router
