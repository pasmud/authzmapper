import { Router, Request, Response } from 'express'
import { getDb, dbQuery, dbGet } from '../db/index.js'

const router = Router()

router.get('/reports/:scanId/markdown', async (req: Request, res: Response) => {
  const db = await getDb()
  const scanId = parseInt(String(req.params.scanId), 10)

  const scan = dbGet(db, 'SELECT * FROM scans WHERE id = ?', [scanId])
  if (!scan) {
    res.status(404).json({ error: 'Scan not found' })
    return
  }

  const spec = dbGet(db, 'SELECT * FROM specs WHERE id = ?', [scan.specId])
  const results = dbQuery(db, 'SELECT * FROM scan_results WHERE scan_id = ?', [scanId])
  const findings = dbQuery(db, 'SELECT * FROM scan_findings WHERE scan_id = ?', [scanId])
  const scanRoles = dbQuery(db, `SELECT r.* FROM roles r JOIN scan_roles sr ON r.id = sr.role_id WHERE sr.scan_id = ?`, [scanId])

  let md = `# AuthzMapper Report: ${scan.name}\n\n`
  md += `**API**: ${spec?.name || 'Unknown'} v${spec?.version || '?'}  \n`
  md += `**Target**: ${scan.targetUrl}  \n`
  md += `**Date**: ${scan.createdAt}  \n`
  md += `**Status**: ${scan.status}  \n`
  md += `**Tests**: ${scan.totalTests} total, ${scan.passedTests} passed, ${scan.failedTests} failed  \n\n`

  md += `## Roles Tested\n\n`
  for (const role of scanRoles) {
    md += `- ${role.name}: ${role.description || 'No description'}\n`
  }

  md += `\n## Findings\n\n`
  if (findings.length === 0) {
    md += `No findings. All authorization checks passed.\n`
  } else {
    for (const f of findings) {
      md += `### ${f.severity.toUpperCase()}: ${f.type.toUpperCase()} - ${f.endpoint}\n\n`
      md += `- **Description**: ${f.description}\n`
      md += `- **Severity**: ${f.severity}\n`
      md += `- **Status**: ${f.isFixed ? 'Fixed' : 'Open'}\n`
      md += `- **Remediation**: ${f.remediation}\n\n`
    }
  }

  md += `## Results Summary\n\n`
  md += `| Method | Path | Role | Expected | Actual | Finding |\n`
  md += `|--------|------|------|----------|--------|--------|\n`
  for (const r of results) {
    const finding = r.isFinding ? (r.findingType || 'issue') : 'pass'
    md += `| ${r.method} | ${r.path} | ${r.roleId} | ${r.expectedStatus} | ${r.responseStatus} | ${finding} |\n`
  }

  res.set('Content-Type', 'text/markdown')
  res.set('Content-Disposition', `attachment; filename="authzmapper-report-${scanId}.md"`)
  res.send(md)
})

router.get('/reports/:scanId/json', async (req: Request, res: Response) => {
  const db = await getDb()
  const scanId = parseInt(String(req.params.scanId), 10)

  const scan = dbGet(db, 'SELECT * FROM scans WHERE id = ?', [scanId])
  if (!scan) {
    res.status(404).json({ error: 'Scan not found' })
    return
  }

  const spec = dbGet(db, 'SELECT * FROM specs WHERE id = ?', [scan.specId])
  const results = dbQuery(db, 'SELECT * FROM scan_results WHERE scan_id = ?', [scanId])
  const findings = dbQuery(db, 'SELECT * FROM scan_findings WHERE scan_id = ?', [scanId])
  const scanRoles = dbQuery(db, `SELECT r.* FROM roles r JOIN scan_roles sr ON r.id = sr.role_id WHERE sr.scan_id = ?`, [scanId])

  const report = {
    reportName: scan.name,
    generatedAt: new Date().toISOString(),
    api: { name: spec?.name, version: spec?.version },
    target: scan.targetUrl,
    summary: {
      totalTests: scan.totalTests,
      passed: scan.passedTests,
      failed: scan.failedTests,
      status: scan.status,
    },
    roles: scanRoles,
    findings: findings.map((f: any) => ({
      type: f.type,
      severity: f.severity,
      endpoint: f.endpoint,
      description: f.description,
      remediation: f.remediation,
      isFixed: !!f.isFixed,
    })),
    results: results.map((r: any) => ({
      method: r.method,
      path: r.path,
      roleId: r.roleId,
      expectedStatus: r.expectedStatus,
      actualStatus: r.responseStatus,
      finding: r.isFinding ? r.findingType : null,
    })),
  }

  res.set('Content-Disposition', `attachment; filename="authzmapper-report-${scanId}.json"`)
  res.json(report)
})

export default router
