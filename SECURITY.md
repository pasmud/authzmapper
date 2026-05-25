# Security Policy

## Responsible Use

AuthzMapper is a defensive security testing tool. It is designed to help developers and security engineers identify authorization vulnerabilities in APIs they own or are authorized to test.

**What this tool will NOT do:**
- Scan or test systems without explicit user authorization
- Perform exploit chaining, brute force attacks, or credential theft
- Execute any payloads against target systems
- Automate unauthorized access or data extraction

## Supported Scope

AuthzMapper is intended for:
- Local development and testing environments
- APIs, systems, and infrastructure you own
- Systems you have explicit written authorization to test

## Vulnerability Reporting

If you discover a vulnerability in AuthzMapper itself:
1. Do NOT open a public GitHub issue
2. Report it by contacting the repository maintainer
3. Include a description, reproduction steps, and impact assessment

We will acknowledge receipt within 48 hours and work toward a resolution.

## Data Handling

- All scan data is stored locally in a SQLite database
- Authentication tokens are stored in the local database; they are never sent to external services
- Sensitive headers (Authorization, Cookie, Set-Cookie, X-API-Key) are redacted in:
  - UI displays (show first/last 4 characters only)
  - Log output
  - Exported reports (Markdown and JSON)
- No telemetry, analytics, or external data transmission

## Secret Redaction Approach

Header redaction pattern:
- Values shorter than 9 characters: replaced with `****`
- Values 9+ characters: show first 4 + `...` + last 4 characters

This allows developers to verify which token is being used while preventing token exposure in reports and logs.

## Dependencies

We regularly update dependencies to address known vulnerabilities. Run `npm audit` to check for vulnerabilities in your deployment.
