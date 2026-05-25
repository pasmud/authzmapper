import { getDb, dbGet, dbRun, saveDatabase } from './index.js'

async function main() {
  const db = await getDb()

  const roles = [
    { name: 'anonymous', description: 'Unauthenticated user' },
    { name: 'user_a', description: 'Regular user A' },
    { name: 'user_b', description: 'Regular user B' },
    { name: 'admin', description: 'Administrator' },
  ]

  for (const role of roles) {
    const existing = dbGet(db, 'SELECT id FROM roles WHERE name = ?', [role.name])
    if (!existing) {
      dbRun(db, 'INSERT INTO roles (name, description) VALUES (?, ?)', [role.name, role.description])
      console.log(`Created role: ${role.name}`)
    }
  }

  saveDatabase()
  console.log('Seeding complete')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
