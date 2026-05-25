# AuthzMapper - Data Model

## Overview
SQLite database managed via Prisma ORM. All data stored locally.

## Entity Relationship Diagram

```
Spec ──┬── Endpoint
       └── AuthScheme

Scan ──┬── ScanEndpoint ──┬── ScanResult
       │                  └── Endpoint
       │
       ├── ScanRole ────── Role
       └── ScanFinding

Role ── Token
```

## Tables

### Spec
Represents an imported OpenAPI specification.

| Column      | Type     | Description                          |
|-------------|----------|--------------------------------------|
| id          | Int (PK) | Auto-increment                       |
| name        | String   | API name from spec title             |
| version     | String   | API version from spec version        |
| raw         | String   | Raw spec JSON/YAML text              |
| format      | String   | "json" or "yaml"                     |
| source_url  | String?  | URL if imported from URL             |
| createdAt   | DateTime |                                      |
| updatedAt   | DateTime |                                      |

### AuthScheme
Authentication schemes defined in the spec.

| Column      | Type          | Description                     |
|-------------|---------------|---------------------------------|
| id          | Int (PK)      |                                 |
| specId      | Int (FK)      | References Spec                 |
| type        | String        | "bearer", "apiKey", "oauth2"    |
| name        | String        | Scheme name                     |
| in_header   | String?       | Header name for API key         |

### Endpoint
Parsed API endpoint from spec.

| Column      | Type          | Description                     |
|-------------|---------------|---------------------------------|
| id          | Int (PK)      |                                 |
| specId      | Int (FK)      | References Spec                 |
| path        | String        | URL path template               |
| method      | String        | GET, POST, PUT, PATCH, DELETE   |
| summary     | String?       | Endpoint summary                |
| operationId | String?       | Unique operation identifier     |
| auth_required| Boolean      | Whether auth is required        |
| object_id_param| String?   | Parameter name for object ID    |

### Role
Represents a testing role.

| Column      | Type          | Description                     |
|-------------|---------------|---------------------------------|
| id          | Int (PK)      |                                 |
| name        | String        | "anonymous", "user_a", "user_b", "admin" |
| description | String?       | Role description                |

### Token
Authentication tokens associated with roles.

| Column      | Type          | Description                     |
|-------------|---------------|---------------------------------|
| id          | Int (PK)      |                                 |
| roleId      | Int (FK)      | References Role                 |
| type        | String        | "bearer", "header", "cookie"    |
| value       | String        | Encrypted/plain token value     |
| header_name | String?       | Custom header name              |
| is_redacted | Boolean       | Whether value is redacted       |

### Scan
Represents a scan/test execution.

| Column      | Type          | Description                     |
|-------------|---------------|---------------------------------|
| id          | Int (PK)      |                                 |
| specId      | Int (FK)      | References Spec                 |
| name        | String        | Scan name                       |
| status      | String        | "pending", "running", "completed", "failed" |
| target_url  | String        | Base URL for API under test     |
| total_tests | Int           | Total number of test cases      |
| passed_tests| Int           | Number of passed tests          |
| failed_tests| Int           | Number of failed (finding) tests|
| startedAt   | DateTime?     |                                 |
| completedAt | DateTime?     |                                 |
| createdAt   | DateTime      |                                 |

### ScanRole
Many-to-many relationship between Scan and Role.

| Column      | Type          | Description                     |
|-------------|---------------|---------------------------------|
| id          | Int (PK)      |                                 |
| scanId      | Int (FK)      |                                 |
| roleId      | Int (FK)      |                                 |

### ScanEndpoint
Many-to-many relationship between Scan and Endpoint.

| Column      | Type          | Description                     |
|-------------|---------------|---------------------------------|
| id          | Int (PK)      |                                 |
| scanId      | Int (FK)      |                                 |
| endpointId  | Int (FK)      |                                 |

### ScanResult
Individual test result within a scan.

| Column       | Type          | Description                        |
|--------------|---------------|------------------------------------|
| id           | Int (PK)      |                                    |
| scanId       | Int (FK)      | References Scan                    |
| endpointId   | Int (FK)      | References Endpoint                |
| roleId       | Int (FK)      | References Role                    |
| method       | String        | HTTP method                        |
| path         | String        | Resolved path with parameters      |
| request_url  | String        | Full request URL                   |
| request_headers| String (JSON)| Redacted request headers           |
| request_body | String?       | Request body                       |
| response_status| Int         | Actual HTTP status code            |
| response_headers| String (JSON)| Redacted response headers        |
| response_body| String?       | Response body (truncated)          |
| expected_status| Int         | Expected HTTP status code          |
| is_finding   | Boolean       | Whether this is a potential finding|
| finding_type | String?       | "bola" or "bfla" or null           |
| finding_desc | String?       | Human-readable finding description |
| duration_ms  | Int           | Request duration in milliseconds   |
| created_at   | DateTime      |                                    |

### ScanFinding
Aggregated findings from a scan.

| Column       | Type          | Description                        |
|--------------|---------------|------------------------------------|
| id           | Int (PK)      |                                    |
| scanId       | Int (FK)      | References Scan                    |
| resultId     | Int (FK)      | References ScanResult              |
| type         | String        | "bola", "bfla"                     |
| severity     | String        | "high", "medium", "low"           |
| endpoint     | String        | Path + method                      |
| description  | String        | Finding description                |
| remediation  | String        | Remediation steps                  |
| is_fixed     | Boolean       | Whether marked as fixed            |

## Redaction Strategy
- Tokens: Show first 4 and last 4 characters only (e.g., "eyJh...mN0")
- Headers: Redact Authorization, Cookie, Set-Cookie, X-API-Key
- Sensitive config: Never stored in code or logs
