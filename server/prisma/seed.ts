import { getDb } from '../src/db/index.js'
import { roles } from '../src/db/schema.js'

async function main() {
  const db = await getDb()

  const roleNames = ['anonymous', 'user_a', 'user_b', 'admin']
  const roleDescs: Record<string, string> = {
    anonymous: 'Unauthenticated user',
    user_a: 'Regular user A',
    user_b: 'Regular user B',
    admin: 'Administrator',
  }

  for (const name of roleNames) {
    const existing = await db.select().from(roles).where(
      // @ts-ignore
      (r, { eq }) => eq(r.name, name)
    ).all()
    if (existing.length === 0) {
      await db.insert(roles).values({
        name,
        description: roleDescs[name],
      })
      console.log(`Created role: ${name}`)
    }
  }

  console.log('Seeding complete')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
