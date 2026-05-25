import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from './middleware/rateLimit.js'
import { requestTimeout } from './middleware/timeout.js'
import { errorHandler } from './middleware/errorHandler.js'
import path from 'path'
import { fileURLToPath } from 'url'
import healthRoutes from './routes/health.js'
import specRoutes from './routes/specs.js'
import roleRoutes from './routes/roles.js'
import scanRoutes from './routes/scans.js'
import reportRoutes from './routes/reports.js'
import demoRoutes from './demo/routes.js'
import { getDb } from './db/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  await getDb()

  const app = express()
  const port = parseInt(process.env.BACKEND_PORT || '3001', 10)

  app.use(helmet({ contentSecurityPolicy: false }))
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))
  app.use(rateLimit)
  app.use(requestTimeout)

  // Mount routes
  app.use('/api', healthRoutes)
  app.use('/api', specRoutes)
  app.use('/api', roleRoutes)
  app.use('/api', scanRoutes)
  app.use('/api', reportRoutes)
  app.use('/api', demoRoutes)

  // Serve frontend static files in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, '../../dist')
    app.use(express.static(distPath))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  app.use(errorHandler)

  app.listen(port, () => {
    console.log(`AuthzMapper backend running on port ${port}`)
    console.log(`Demo API available at http://localhost:${port}/api/demo`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
