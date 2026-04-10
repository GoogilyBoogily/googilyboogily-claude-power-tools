# Security Checklist

Evaluate the target code against every item below. Flag any violation or concern.

## Injection Vectors
- [ ] Is user input ever interpolated directly into SQL queries without parameterized statements?
- [ ] Is user input rendered into HTML without escaping, enabling cross-site scripting (XSS)?
- [ ] Is user input passed to shell commands, `exec`, `eval`, or system calls without sanitization?
- [ ] Is user input used to construct file paths without preventing path traversal (e.g., `../../etc/passwd`)?
- [ ] Is user input used in template engines, regex constructors, or LDAP queries without escaping?
- [ ] Are HTTP headers, cookies, or URL parameters trusted without validation?

## Authentication & Authorization
- [ ] Are authentication checks present on every endpoint/route that requires them?
- [ ] Is authorization enforced — not just "is the user logged in" but "is this user allowed to do this action on this resource"?
- [ ] Are there endpoints that expose data or actions without any auth check (broken access control)?
- [ ] Is session management secure — proper token expiry, rotation, and invalidation on logout?
- [ ] Are password handling practices sound — hashing with bcrypt/argon2, no plaintext storage, no reversible encryption?
- [ ] Is there protection against brute force (rate limiting, account lockout, CAPTCHA)?

## Secrets & Credential Management
- [ ] Are API keys, tokens, passwords, or connection strings hardcoded in source code?
- [ ] Are secrets committed to version control (check for `.env` files, config files with credentials)?
- [ ] Are secrets loaded from environment variables or a secrets manager rather than config files?
- [ ] Are secrets logged, included in error messages, or exposed in API responses?
- [ ] Are default credentials (admin/admin, root/root) present in any configuration?

## Input Validation & Sanitization
- [ ] Is all external input validated for type, length, range, and format before use?
- [ ] Are file uploads validated for type, size, and content — not just file extension?
- [ ] Is deserialization of untrusted data avoided, or are safe deserializers used?
- [ ] Are JSON/XML parsers configured to reject entity expansion (XXE) and oversized payloads?
- [ ] Is there validation on both client and server side, not just client side?

## Data Exposure & Privacy
- [ ] Are sensitive fields (SSN, credit card, health data) excluded from logs, error messages, and API responses?
- [ ] Are API responses filtered to include only the fields the caller needs (no over-fetching of sensitive data)?
- [ ] Is data encrypted at rest and in transit (TLS for network, encryption for stored sensitive data)?
- [ ] Are CORS policies restrictive — not `Access-Control-Allow-Origin: *` on sensitive endpoints?
- [ ] Is PII handled according to relevant regulations (GDPR right to deletion, data minimization)?

## Dependency Vulnerabilities
- [ ] Are dependencies pinned to specific versions, not floating ranges that could pull in compromised packages?
- [ ] Are there known CVEs in the current dependency versions?
- [ ] Are dependencies from trusted sources — no typosquatting, no unmaintained packages with known issues?
- [ ] Is there a lockfile (package-lock.json, yarn.lock, Cargo.lock) committed and enforced?
- [ ] Are dependency permissions audited — do packages request more access than they should need?
