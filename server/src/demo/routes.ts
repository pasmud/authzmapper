import { Router, Request, Response } from 'express'

const router = Router()

interface DemoUser {
  id: number
  username: string
  role: string
  email: string
}

interface DemoOrder {
  id: number
  userId: number
  product: string
  amount: number
}

const demoUsers: DemoUser[] = [
  { id: 1, username: 'user_a', role: 'user', email: 'usera@example.com' },
  { id: 2, username: 'user_b', role: 'user', email: 'userb@example.com' },
  { id: 3, username: 'admin', role: 'admin', email: 'admin@example.com' },
]

const demoOrders: DemoOrder[] = [
  { id: 1, userId: 1, product: 'Widget A', amount: 29.99 },
  { id: 2, userId: 2, product: 'Gadget B', amount: 49.99 },
  { id: 3, userId: 1, product: 'Doohickey C', amount: 99.99 },
]

let bolaFixed = false
let bflaFixed = false

// Demo health
router.get('/demo/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', demo: true, bola_fixed: bolaFixed, bfla_fixed: bflaFixed })
})

// Get user by ID (BOLA vulnerability: no ownership check)
router.get('/demo/users/:id', (req: Request, res: Response) => {
  const userId = parseInt(String(req.params.id), 10)
  const user = demoUsers.find(u => u.id === userId)

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  // BOLA: No token/ownership check - any anonymous request gets data
  if (bolaFixed) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
  }

  res.json(user)
})

// Get order by ID (BOLA vulnerability: any user can access any order)
router.get('/demo/orders/:id', (req: Request, res: Response) => {
  const orderId = parseInt(String(req.params.id), 10)
  const order = demoOrders.find(o => o.id === orderId)

  if (!order) {
    res.status(404).json({ error: 'Order not found' })
    return
  }

  if (bolaFixed) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
    const token = authHeader.replace('Bearer ', '')
    if (token === 'user_a_token' && order.userId !== 1) {
      res.status(403).json({ error: 'Forbidden: you do not own this order' })
      return
    }
    if (token === 'user_b_token' && order.userId !== 2) {
      res.status(403).json({ error: 'Forbidden: you do not own this order' })
      return
    }
  }

  res.json(order)
})

// Admin endpoints (BFLA vulnerability: no role check)
router.get('/demo/admin/users', (_req: Request, res: Response) => {
  if (bflaFixed) {
    const authHeader = _req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
    const token = authHeader.replace('Bearer ', '')
    if (token !== 'admin_token') {
      res.status(403).json({ error: 'Forbidden: admin access required' })
      return
    }
  }

  res.json(demoUsers)
})

router.delete('/demo/admin/users/:id', (req: Request, res: Response) => {
  if (bflaFixed) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
    const token = authHeader.replace('Bearer ', '')
    if (token !== 'admin_token') {
      res.status(403).json({ error: 'Forbidden: admin access required' })
      return
    }
  }

  const userId = parseInt(String(req.params.id), 10)
  const idx = demoUsers.findIndex(u => u.id === userId)
  if (idx === -1) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({ message: `User ${userId} deleted (simulated)` })
})

router.post('/demo/admin/settings', (req: Request, res: Response) => {
  if (bflaFixed) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
    const token = authHeader.replace('Bearer ', '')
    if (token !== 'admin_token') {
      res.status(403).json({ error: 'Forbidden: admin access required' })
      return
    }
  }

  res.json({ message: 'Settings updated (simulated)', settings: req.body })
})

// Toggle fix modes for regression testing
router.post('/demo/fix/bola', (req: Request, res: Response) => {
  bolaFixed = req.body.fixed ?? !bolaFixed
  res.json({ bola_fixed: bolaFixed })
})

router.post('/demo/fix/bfla', (req: Request, res: Response) => {
  bflaFixed = req.body.fixed ?? !bflaFixed
  res.json({ bfla_fixed: bflaFixed })
})

// Demo OpenAPI spec
router.get('/demo/openapi.json', (_req: Request, res: Response) => {
  res.json({
    openapi: '3.0.3',
    info: { title: 'Demo Vulnerable API', version: '1.0.0', description: 'Intentionally vulnerable API for BOLA/BFLA testing' },
    servers: [{ url: 'http://localhost:3099' }],
    paths: {
      '/api/demo/health': {
        get: { summary: 'Health check', operationId: 'demoHealth', responses: { '200': { description: 'OK' } } },
      },
      '/api/demo/users/{id}': {
        get: {
          summary: 'Get user by ID',
          operationId: 'getDemoUser',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'User data' }, '404': { description: 'Not found' } },
        },
      },
      '/api/demo/orders/{id}': {
        get: {
          summary: 'Get order by ID',
          operationId: 'getDemoOrder',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Order data' }, '404': { description: 'Not found' } },
        },
      },
      '/api/demo/admin/users': {
        get: {
          summary: 'List all users (admin)',
          operationId: 'listAdminUsers',
          responses: { '200': { description: 'User list' } },
        },
      },
      '/api/demo/admin/users/{id}': {
        delete: {
          summary: 'Delete user (admin)',
          operationId: 'deleteAdminUser',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Deleted' } },
        },
      },
      '/api/demo/admin/settings': {
        post: {
          summary: 'Update settings (admin)',
          operationId: 'updateAdminSettings',
          responses: { '200': { description: 'Updated' } },
        },
      },
    },
  })
})

export default router
