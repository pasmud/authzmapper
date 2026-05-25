# AuthzMapper - Test Plan

## Test Levels

### 1. Unit Tests (Vitest)
Run via: `npm test`

#### Backend Unit Tests
| Test | Description |
|------|-------------|
| Spec Parser | Parse OpenAPI JSON/YAML, extract endpoints, auth schemes, object ID params |
| Matrix Generator | Generate correct test matrix from endpoints × roles |
| Request Executor | Execute HTTP requests with proper headers, handle timeouts |
| Response Analyzer | Compare expected vs actual status, detect BOLA/BFLA patterns |
| Redactor | Redact sensitive headers, tokens, cookies in request/response data |
| Role Manager | CRUD operations for roles and tokens |
| Demo API | Verify demo endpoints return correct data per role |

#### Frontend Unit Tests
| Test | Description |
|------|-------------|
| API Client | Correct endpoint calls, error handling |
| Utility Functions | Redaction display, formatting, validation |

### 2. Integration Tests (Vitest)
Run via: `npm run test:integration`

| Test | Description |
|------|-------------|
| Scan Flow | Import spec → configure roles → run scan → get results |
| Report Generation | Generate Markdown and JSON reports from scan results |
| Demo API E2E | Run scan against demo API, detect BOLA/BFLA findings |

### 3. End-to-End Tests (Playwright)
Run via: `npm run test:e2e`

| Test | Description |
|------|-------------|
| Spec Import | Upload OpenAPI spec, verify endpoints displayed |
| Dashboard Load | Verify dashboard renders with correct data |
| Scan Execution | Configure and run scan, check results |
| BOLA Detection | Run against demo API, confirm BOLA finding detected |
| BFLA Detection | Run against demo API, confirm BFLA finding detected |
| Regression Test | Fix endpoint, re-scan, confirm finding resolved |
| Report Export | Generate and download reports |
| Safety Flow | Verify confirmation dialog for non-localhost URLs |

### 4. Static Analysis
| Tool | Command |
|------|---------|
| TypeScript | `npm run typecheck` |
| ESLint | `npm run lint` |

### 5. Build Verification
| Check | Command |
|-------|---------|
| Frontend Build | `npm run build` (Vite) |
| Backend Build | `tsc --noEmit` |
| Docker Build | `docker compose build` |

## Test Scenarios

### Scenario 1: BOLA Detection
1. Start demo API
2. Import demo OpenAPI spec
3. Configure roles: anonymous, user_a, user_b, admin
4. Set tokens for user_a and user_b
5. Run scan against demo API
6. Verify finding: user_a can access user_b's resource (BOLA)

### Scenario 2: BFLA Detection
1. Use same setup as Scenario 1
2. Verify finding: low-priv user can access admin endpoint (BFLA)

### Scenario 3: Regression Test
1. Enable "fixed" demo endpoint
2. Re-run scan
3. Verify BOLA/BFLA finding no longer present

### Scenario 4: Empty/Error Handling
- Import invalid spec → error message
- Scan without roles configured → validation error
- Network timeout → graceful error
- Empty results → appropriate empty state

## Environment
- Test DB: In-memory SQLite via `:memory:`
- Demo API: Local Express server on random port
- CI: GitHub Actions (ubuntu-latest, Node.js 20)

## Coverage Goals
- Backend: >80% line coverage
- Frontend: >60% line coverage (component tests)
- E2E: Critical user flows covered
