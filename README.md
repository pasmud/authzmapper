# AuthzMapper

**API Authorization Testing Dashboard** — Identify Broken Object Level Authorization (BOLA) and Broken Function Level Authorization (BFLA) vulnerabilities in APIs you own or are authorized to test.

## Safety Boundary

AuthzMapper is a **defensive cybersecurity tool**. It:
- Runs **local-first** with a built-in demo API for safe testing
- Requires explicit authorization confirmation before testing non-localhost URLs
- Does **not** perform exploit chaining, brute forcing, credential theft, or any offensive/unauthorized activity
- Redacts sensitive tokens and headers in logs, UI, and exports

> Only scan systems, code, APIs, and infrastructure you own or are authorized to test.

## Features

- **OpenAPI Spec Import** — Upload JSON/YAML specs; parse endpoints, path params, auth schemes, and object ID parameters
- **Role-Based Test Matrix** — Define roles (anonymous, user_a, user_b, admin) with per-role tokens
- **Automated Scanning** — Generate and execute a test matrix across all endpoints × roles × object owners
- **BOLA/BFLA Detection** — Identify cross-user object access and privilege escalation issues
- **Built-in Vulnerable Demo API** — Intentionally vulnerable local API with BOLA and BFLA flaws for safe learning
- **Evidence Viewer** — Inspect individual request/response pairs with redacted sensitive data
- **Remediation Guidance** — Actionable remediation steps for each finding
- **Report Export** — Download results as Markdown or JSON
- **Regression Testing** — Toggle fixes and re-scan to verify resolutions

## Prerequisites

- Node.js 20+
- npm

## Local Run

```bash
# Install dependencies
npm install

# Set up database
npm run db:seed

# Start development servers
npm run dev:all
# Or separately:
# Terminal 1: npm run server   (Backend on :3001)
# Terminal 2: npm run dev      (Frontend on :5173)
```

Then open http://localhost:5173

## Docker Run

```bash
docker compose up --build
```

Open http://localhost:3001

## Quick Start

1. Open the dashboard at http://localhost:5173
2. Go to **Import Spec** and click **Import Demo API Spec**
3. Go to **Roles** and configure tokens (optional for demo API)
4. Go to **Scans**, select the imported spec, and click **Run Scan**
5. Review findings on the results page
6. Toggle fix modes on the Evidence page and re-scan for regression testing

## Test Commands

```bash
npm test              # Unit tests (Vitest)
npm run typecheck     # TypeScript type checking
npm run lint          # ESLint
npm run build         # Production build
npm run test:e2e      # Playwright E2E tests (requires dev servers running)
```

## Project Structure

```
authzmapper/
├── server/             # Express backend
│   └── src/
│       ├── routes/     # API route handlers
│       ├── engine/     # Scan engine (parser, matrix, executor, analyzer, redactor)
│       ├── demo/       # Intentionally vulnerable demo API
│       ├── middleware/  # Rate limiting, timeout, error handling
│       └── db/         # SQLite database layer
├── src/                # React frontend
│   └── components/     # UI components
├── e2e/                # Playwright E2E tests
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Tech Stack

- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS 4
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (via sql.js)
- **Testing**: Vitest, Playwright
- **Container**: Docker, Docker Compose
