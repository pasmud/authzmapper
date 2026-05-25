# AuthzMapper - Architecture

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React + Vite + Tailwind                             │   │
│  │  - Dashboard                                         │   │
│  │  - Spec Import                                       │   │
│  │  - Test Configuration                                │   │
│  │  - Results Matrix                                    │   │
│  │  - Evidence Viewer                                   │   │
│  │  - Report Export                                     │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTP/REST (JSON)
                          │
┌─────────────────────────┼───────────────────────────────────┐
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │           Express Backend (Node.js + TypeScript)     │   │
│  │                                                      │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │   │
│  │  │ API Routes  │  │ Scan Engine  │  │ Demo API   │ │   │
│  │  │             │  │              │  │ (BOLA/BFLA)│ │   │
│  │  │ /api/specs  │  │ - Matrix     │  │            │ │   │
│  │  │ /api/roles  │  │ - Executor   │  │ /api/users │ │   │
│  │  │ /api/scans  │  │ - Analyzer   │  │ /api/orders│ │   │
│  │  │ /api/reports│  │ - Redactor   │  │ /api/admin │ │   │
│  │  │ /api/health │  └──────────────┘  └────────────┘ │   │
│  │  └─────────────┘                                    │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Prisma ORM + SQLite                          │   │   │
│  │  │  - specs, roles, tokens, scans, results,      │   │   │
│  │  │    findings, reports                          │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components
```
src/
├── components/
│   ├── Layout/           # App shell, nav, header
│   ├── Dashboard/        # Main dashboard view
│   ├── SpecImport/       # OpenAPI spec upload/parse
│   ├── Roles/            # Role and token management
│   ├── ScanMatrix/       # Test matrix configuration
│   ├── Results/          # Results dashboard
│   ├── Evidence/         # Request/response evidence viewer
│   ├── Reports/          # Report export controls
│   └── common/           # Shared UI components
├── hooks/                # Custom React hooks
├── services/             # API client layer
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### Backend Structure
```
server/
├── src/
│   ├── routes/           # Express route handlers
│   │   ├── specs.ts      # OpenAPI spec endpoints
│   │   ├── roles.ts      # Role management endpoints
│   │   ├── scans.ts      # Scan execution endpoints
│   │   ├── reports.ts    # Report generation endpoints
│   │   └── health.ts     # Health check
│   ├── engine/           # Scan engine
│   │   ├── parser.ts     # OpenAPI spec parser
│   │   ├── matrix.ts     # Test matrix generator
│   │   ├── executor.ts   # Request executor
│   │   ├── analyzer.ts   # Response analyzer
│   │   └── redactor.ts   # Sensitive data redaction
│   ├── demo/             # Intentionally vulnerable demo API
│   │   └── routes.ts     # BOLA/BFLA demo endpoints
│   ├── middleware/        # Express middleware
│   │   ├── rateLimit.ts
│   │   ├── timeout.ts
│   │   └── errorHandler.ts
│   ├── db/               # Database layer
│   │   └── prisma/       # Prisma schema and client
│   ├── types/            # TypeScript types
│   └── index.ts          # Entry point
```

## Data Flow

1. **Import Flow**: Upload spec → Parse → Store endpoints, schemas, auth schemes
2. **Scan Flow**: Select spec & roles → Generate matrix → Execute requests → Analyze responses → Store results → Flag findings
3. **Report Flow**: Select scan → Generate Markdown/JSON → Download
4. **Demo Flow**: Start demo server → Import demo spec → Run scan → See BOLA/BFLA findings

## Port Management
- Detect free ports in range 42000-49999
- Backend port written to `.env`
- Frontend dev server on user-selected port
- Demo API runs on backend port with `/api/demo` prefix

## Security Architecture
- All data in local SQLite (no external DB)
- Sensitive tokens redacted in logs, UI, and exports
- Rate limiting: 10 req/s per target
- Request timeout: 30s
- Safety confirmation for non-localhost targets
- CORS restricted in production
- Security headers via Helmet
