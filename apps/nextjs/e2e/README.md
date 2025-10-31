# E2E Tests

This directory contains Playwright end-to-end tests for the NextJS application.

## Running Tests

To run the tests:

```bash
# From the root of the project
pnpm -F nextjs playwright test

# Or from the nextjs directory
cd apps/nextjs
pnpm playwright test
```

## Test Structure

- `*.spec.ts` - Playwright test files
- `helpers.ts` - Common helper functions for tests

## Test Data Cleanup

The tests use a cleanup mechanism to ensure test data doesn't accumulate between test runs. Before each test suite runs, the `cleanupTestData` function from `helpers.ts` will automatically delete any test data matching certain patterns (e.g., items containing "SUPER TEST").

If you need to add more cleanup logic, extend the `cleanupTestData` function in `helpers.ts`.

## Separate from Unit Tests

These tests are kept separate from the unit tests in `__tests__/` directory, which are run with Vitest.
