# AuthzMapper - Product Specification

## Overview
AuthzMapper is a local-first API authorization testing dashboard that helps security engineers and developers identify Broken Object Level Authorization (BOLA) and Broken Function Level Authorization (BFLA) vulnerabilities in APIs they own or are authorized to test.

## Problem Statement
API authorization vulnerabilities (BOLA/BFLA) are the most common API security issues per OWASP. Existing tools are either commercial, require complex setup, or lack structured reporting. AuthzMapper provides a simple, local-first dashboard with a built-in intentionally vulnerable demo API for safe learning and testing.

## Target Users
- API developers building authorization logic
- Security engineers conducting authorized API reviews
- QA engineers automating auth regression tests
- Security students learning about API authorization

## Core Features

### 1. OpenAPI Spec Import
- Upload OpenAPI 3.0/3.1 JSON or YAML specification
- Parse endpoints, methods, path parameters, query parameters, request bodies
- Extract authentication schemes (bearer, API key, OAuth2)
- Identify object ID parameters from path/query/body definitions

### 2. Role & Identity Management
- Define roles: anonymous, user_a, user_b, admin
- Store authentication tokens/headers securely (never committed or logged raw)
- Token redaction in all logs, exports, and evidence views

### 3. Authorization Test Matrix
Generate and execute a matrix of:
- Endpoint × Method × Role × Object Owner
- For each cell: send request, capture response, compare expected vs actual status
- Detect deviations: 200 where 401/403 expected (BOLA/BFLA indicator)

### 4. Built-in Intentionally Vulnerable Demo API
- Local Express server with predictable auth flaws
- Endpoints: `/api/users/:id`, `/api/orders/:id`, `/api/admin/*`
- Pre-configured BOLA (user can access another user's data) and BFLA (low-priv accesses admin) vulnerabilities
- Fix endpoint to validate "fixed" behavior in regression tests

### 5. Safety Controls
- No external scanning by default; localhost/demo only out of the box
- Confirmation checkbox: "I confirm I am authorized to test this target"
- Not applicable for localhost/demo targets
- Rate limiting (max 10 req/s per target)
- Request timeout (30s default, configurable)
- No exploit chaining, brute forcing, or bypass logic

### 6. Evidence & Reporting
- Request/response viewer with redacted sensitive headers
- Redacted token display (show first/last 4 chars only)
- Remediation checklist per finding type
- Export: Markdown report, JSON report

### 7. Regression Testing
- Compare current scan results against baseline
- Flag new findings or regressions
- Mark findings as fixed and re-test

## Non-Goals
- Not a vulnerability scanner for unknown/third-party APIs
- No exploit automation
- No brute force or credential stuffing
- No DAST/SAST replacement

## User Interface Flow
1. Welcome page with safety notice
2. Import OpenAPI spec (upload or paste URL)
3. Configure roles and tokens
4. Run authorization test matrix
5. View results dashboard with findings
6. Drill into individual findings for evidence
7. Export report
8. Run regression tests after fixes

## Technical Requirements
- Local-first: all data stored in SQLite
- Single-page application with dashboard UI
- RESTful backend API
- Docker Compose for one-command setup
- Dark mode UI
- Responsive design
