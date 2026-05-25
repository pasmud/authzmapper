# Research Notes: AuthzMapper

## OWASP API Security Top 10

### API1:2023 - Broken Object Level Authorization (BOLA)
- Most common API vulnerability
- Occurs when API does not properly verify the requesting user owns the requested object
- Example: User A changes `GET /api/users/123` to `GET /api/users/456` and accesses another user's data
- Detection: Compare object ownership across users with different roles
- Mitigation: Validate user identity against object ownership on every request

### API2:2023 - Broken Authentication
- Weak or misconfigured authentication mechanisms
- Includes weak API keys, missing token validation, lack of credential rotation
- Detection: Attempt requests with invalid/expired tokens, check response codes

### API3:2023 - Broken Object Property Level Authorization
- Reading or modifying object properties without authorization
- Example: Mass assignment attacks via PATCH endpoints

### API4:2023 - Unrestricted Resource Consumption
- Rate limiting failures, unbounded query parameters, lack of pagination limits
- Leads to DoS via excessive API calls

### API5:2023 - Broken Function Level Authorization (BFLA)
- Occurs when API does not properly restrict function access by role
- Example: Regular user calls `DELETE /api/admin/users` or `POST /api/admin/roles`
- Detection: Matrix test across roles (anonymous, user, admin) for each endpoint/method
- Mitigation: Enforce role-based access control at function level

### API6:2023 - Unrestricted Access to Sensitive Business Flows
- Automated access to sensitive workflows (e.g., ticket buying, voting)

### API7:2023 - Server Side Request Forgery (SSRF)
- API fetches remote resources without validating user-supplied URLs

### API8:2023 - Security Misconfiguration
- Default credentials, CORS misconfig, verbose error messages, missing security headers

### API9:2023 - Improper Inventory Management
- Exposed staging/dev API versions, undocumented endpoints

### API10:2023 - Unsafe Consumption of APIs
- Blindly trusting third-party API data without validation

## Broken Object Level Authorization (BOLA) - Deep Dive

### How BOLA Works
```
User A (token_a) -> GET /api/orders/123  # Authorized: User A owns order 123
User A (token_a) -> GET /api/orders/456  # BOLA: User A does NOT own order 456
```

### BOLA Detection Strategy
1. Authenticate as User A and create an object
2. Record the object ID
3. Authenticate as User B
4. Attempt to access User A's object using its ID
5. If 200 OK returns instead of 401/403, BOLA vulnerability is confirmed

### Common BOLA Patterns
- Incrementing numeric IDs in URL paths
- UUIDs in URLs but no server-side ownership check
- Object IDs passed in request bodies without validation
- Nested object access without parent ownership verification

## Broken Function Level Authorization (BFLA) - Deep Dive

### How BFLA Works
```
User (role=viewer) -> DELETE /api/admin/users  # BFLA: viewer should not have admin access
User (role=viewer) -> POST /api/admin/settings  # BFLA: viewer should not modify settings
```

### BFLA Detection Strategy
1. Define roles: anonymous, regular user, admin
2. For each endpoint/method, define expected access per role
3. Test each role against each endpoint
4. Compare actual HTTP status against expected status
5. Flag any case where a lower-privilege role receives a 200 when 401/403 was expected

## Safe Testing Approach

- **Local-first**: All testing targets are local/demo APIs by default
- **Authorization confirmation**: User must explicitly confirm authorization for non-localhost targets
- **No exploit chaining**: Each test is a single request; no automated exploitation
- **No brute forcing**: No password guessing, token brute force, or enumeration
- **No bypass logic**: Tool identifies potential issues but does not attempt to exploit them further

## Remediation Strategies

### BOLA Remediation
- Implement object ownership checks in business logic layer
- Use user-context-aware queries (e.g., `WHERE user_id = current_user.id`)
- Avoid exposing internal/sequential IDs; use opaque identifiers
- Apply authorization middleware at the route level

### BFLA Remediation
- Implement role-based access control middleware
- Adopt a "deny by default" approach to new endpoints
- Use declarative role annotations on route handlers
- Test all roles against all endpoints in CI/CD

## Related Standards & References

- OWASP API Security Top 10: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- OWASP REST Security Cheat Sheet
- NIST SP 800-115 (Security Testing Guidelines)
- IETF RFC 7519 (JWT)
- OAuth 2.0 Authorization Framework (RFC 6749)
