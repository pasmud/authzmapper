import { Router, Request, Response } from 'express'
import { getDb, saveDatabase, dbRun, dbGet, dbQuery } from '../db/index.js'
import { parseSpec } from '../engine/parser.js'

const router = Router()

router.post('/specs', async (req: Request, res: Response) => {
  try {
    const { raw, format, sourceUrl } = req.body
    if (!raw || !format) {
      res.status(400).json({ error: 'raw and format fields are required' })
      return
    }

    const parsed = parseSpec(raw, format)
    const db = await getDb()

    const now = new Date().toISOString()
    dbRun(db, `INSERT INTO specs (name, version, raw, format, source_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [parsed.name, parsed.version, raw, format, sourceUrl || null, now, now])

    const specId = (dbGet(db, 'SELECT last_insert_rowid() as id') as any).id

    for (const scheme of parsed.authSchemes) {
      dbRun(db, 'INSERT INTO auth_schemes (spec_id, type, name, in_header) VALUES (?, ?, ?, ?)',
        [specId, scheme.type, scheme.name, scheme.inHeader])
    }

    for (const ep of parsed.endpoints) {
      dbRun(db, `INSERT INTO endpoints (spec_id, path, method, summary, operation_id, auth_required, object_id_param) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [specId, ep.path, ep.method, ep.summary, ep.operationId, ep.authRequired ? 1 : 0, ep.objectIdParam])
    }

    saveDatabase()

    const spec = dbGet(db, 'SELECT * FROM specs WHERE id = ?', [specId])
    const endpoints = dbQuery(db, 'SELECT * FROM endpoints WHERE spec_id = ?', [specId])
    const schemes = dbQuery(db, 'SELECT * FROM auth_schemes WHERE spec_id = ?', [specId])

    res.status(201).json({ spec, endpoints, authSchemes: schemes })
  } catch (err: any) {
    res.status(400).json({ error: `Failed to parse spec: ${err.message}` })
  }
})

router.get('/specs', async (_req: Request, res: Response) => {
  const db = await getDb()
  const allSpecs = dbQuery(db, 'SELECT * FROM specs ORDER BY created_at DESC')
  res.json(allSpecs)
})

router.get('/specs/:id', async (req: Request, res: Response) => {
  const db = await getDb()
  const id = parseInt(String(req.params.id), 10)
  const spec = dbGet(db, 'SELECT * FROM specs WHERE id = ?', [id])
  if (!spec) {
    res.status(404).json({ error: 'Spec not found' })
    return
  }
  const endpoints = dbQuery(db, 'SELECT * FROM endpoints WHERE spec_id = ?', [id])
  const schemes = dbQuery(db, 'SELECT * FROM auth_schemes WHERE spec_id = ?', [id])
  res.json({ spec, endpoints, authSchemes: schemes })
})

router.delete('/specs/:id', async (req: Request, res: Response) => {
  const db = await getDb()
  const id = parseInt(String(req.params.id), 10)
  dbRun(db, 'DELETE FROM auth_schemes WHERE spec_id = ?', [id])
  dbRun(db, 'DELETE FROM endpoints WHERE spec_id = ?', [id])
  dbRun(db, 'DELETE FROM specs WHERE id = ?', [id])
  saveDatabase()
  res.json({ message: 'Spec deleted' })
})

export default router
