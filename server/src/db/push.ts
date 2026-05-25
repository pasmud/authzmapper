import { getDb } from './index.js'

async function push() {
  await getDb()
  console.log('Database schema pushed successfully')
  process.exit(0)
}

push().catch((err) => {
  console.error('Failed to push schema:', err)
  process.exit(1)
})
