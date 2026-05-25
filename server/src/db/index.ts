import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let sqlDb: SqlJsDatabase | null = null
let dbPath: string = ''

export type Db = SqlJsDatabase

export async function getDb(): Promise<Db> {
  if (sqlDb) return sqlDb

  const dataDir = path.resolve(__dirname, '../../data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const url = process.env.DATABASE_URL || 'file:./data/authzmapper.db'
  dbPath = path.resolve(url.replace('file:', ''))
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const SQL = await initSqlJs()
  let buffer: Buffer | null = null
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath)
  }
  sqlDb = new SQL.Database(buffer)
  sqlDb.run('PRAGMA journal_mode=WAL')
  sqlDb.run('PRAGMA foreign_keys=ON')

  await createTables()

  process.on('exit', () => saveDb())
  process.on('SIGINT', () => { saveDb(); process.exit(0) })
  process.on('SIGTERM', () => { saveDb(); process.exit(0) })

  return sqlDb
}

function saveDb() {
  if (sqlDb && dbPath) {
    const data = sqlDb.export()
    fs.writeFileSync(dbPath, Buffer.from(data))
  }
}

export function saveDatabase() {
  saveDb()
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

export function camelizeRow(row: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(row)) {
    result[toCamelCase(key)] = value
  }
  return result
}

async function createTables() {
  if (!sqlDb) return
  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS specs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      raw TEXT NOT NULL,
      format TEXT NOT NULL,
      source_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_schemes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spec_id INTEGER NOT NULL REFERENCES specs(id),
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      in_header TEXT
    );
    CREATE TABLE IF NOT EXISTS endpoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spec_id INTEGER NOT NULL REFERENCES specs(id),
      path TEXT NOT NULL,
      method TEXT NOT NULL,
      summary TEXT,
      operation_id TEXT,
      auth_required INTEGER NOT NULL DEFAULT 0,
      object_id_param TEXT
    );
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL REFERENCES roles(id),
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      header_name TEXT
    );
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spec_id INTEGER NOT NULL REFERENCES specs(id),
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      target_url TEXT NOT NULL,
      total_tests INTEGER NOT NULL DEFAULT 0,
      passed_tests INTEGER NOT NULL DEFAULT 0,
      failed_tests INTEGER NOT NULL DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS scan_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER NOT NULL REFERENCES scans(id),
      role_id INTEGER NOT NULL REFERENCES roles(id)
    );
    CREATE TABLE IF NOT EXISTS scan_endpoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER NOT NULL REFERENCES scans(id),
      endpoint_id INTEGER NOT NULL REFERENCES endpoints(id)
    );
    CREATE TABLE IF NOT EXISTS scan_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER NOT NULL REFERENCES scans(id),
      endpoint_id INTEGER NOT NULL REFERENCES endpoints(id),
      role_id INTEGER NOT NULL REFERENCES roles(id),
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      request_url TEXT NOT NULL,
      request_headers TEXT NOT NULL,
      request_body TEXT,
      response_status INTEGER NOT NULL,
      response_headers TEXT NOT NULL,
      response_body TEXT,
      expected_status INTEGER NOT NULL,
      is_finding INTEGER NOT NULL DEFAULT 0,
      finding_type TEXT,
      finding_desc TEXT,
      duration_ms INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS scan_findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER NOT NULL REFERENCES scans(id),
      result_id INTEGER NOT NULL REFERENCES scan_results(id),
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      description TEXT NOT NULL,
      remediation TEXT NOT NULL,
      is_fixed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `)
}

export function dbQuery(db: Db, sql: string, params: any[] = []): Record<string, any>[] {
  const stmt = db.prepare(sql)
  if (params.length > 0) stmt.bind(params)
  const results: Record<string, any>[] = []
  while (stmt.step()) {
    results.push(camelizeRow(stmt.getAsObject()))
  }
  stmt.free()
  return results
}

export function dbRun(db: Db, sql: string, params: any[] = []): void {
  if (params.length > 0) {
    const stmt = db.prepare(sql)
    stmt.bind(params)
    stmt.step()
    stmt.free()
  } else {
    db.run(sql)
  }
}

export function dbGet(db: Db, sql: string, params: any[] = []): Record<string, any> | null {
  const stmt = db.prepare(sql)
  if (params.length > 0) stmt.bind(params)
  let result: Record<string, any> | null = null
  if (stmt.step()) {
    result = camelizeRow(stmt.getAsObject())
  }
  stmt.free()
  return result
}
