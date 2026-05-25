# Contributing

We welcome contributions that improve AuthzMapper's defensive security testing capabilities.

## Guidelines

1. **Stay defensive**: All features must be explicitly defensive. No exploit automation, brute forcing, or bypass logic.
2. **Privacy first**: Never introduce telemetry, analytics, or external data transmission.
3. **Security**: Sensitive data (tokens, headers) must always be redacted in logs and UI.
4. **Tests**: Add or update tests for new features. Run `npm test` before submitting.
5. **TypeScript**: All code must be TypeScript with strict mode enabled.

## Development Setup

```bash
npm install
npm run db:seed
npm run dev:all
```

## Running Tests

```bash
npm test              # Unit tests
npm run typecheck     # Type checking
npm run lint           # Linting
npm run test:e2e       # Playwright E2E tests
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Run tests and ensure they pass
5. Push to your fork
6. Open a Pull Request

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
