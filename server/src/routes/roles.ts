import { Router, Request, Response } from 'express'
import { getDb, saveDatabase, dbRun, dbQuery, dbGet } from '../db/index.js'

const router = Router()

router.get('/roles', async (_req: Request, res: Response) => {
  const db = await getDb()
  const allRoles = dbQuery(db, 'SELECT * FROM roles ORDER BY id')
  const result = []

  for (const role of allRoles) {
    const tokens = dbQuery(db, 'SELECT * FROM tokens WHERE role_id = ?', [role.id])
    result.push({ ...role, tokens })
  }

  res.json(result)
})

router.put('/roles/:id/token', async (req: Request, res: Response) => {
  const db = await getDb()
  const roleId = parseInt(String(req.params.id), 10)
  const { type, value, headerName } = req.body

  if (!type || !value) {
    res.status(400).json({ error: 'type and value are required' })
    return
  }

  dbRun(db, 'DELETE FROM tokens WHERE role_id = ? AND type = ?', [roleId, type])

  dbRun(db, 'INSERT INTO tokens (role_id, type, value, header_name) VALUES (?, ?, ?, ?)',
    [roleId, type, value, headerName || null])

  saveDatabase()

  const token = dbGet(db, 'SELECT * FROM tokens WHERE role_id = ? AND type = ?', [roleId, type])
  res.json(token)
})

router.delete('/roles/:id/token', async (req: Request, res: Response) => {
  const db = await getDb()
  const roleId = parseInt(String(req.params.id), 10)
  dbRun(db, 'DELETE FROM tokens WHERE role_id = ?', [roleId])
  saveDatabase()
  res.json({ message: 'Token deleted' })
})

export default router
