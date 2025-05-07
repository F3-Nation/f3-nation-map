# Unit Tests

This directory contains Vitest unit tests for the NextJS application.

## Running Tests

To run the tests:

```bash
# From the root of the project
pnpm -F nextjs test

# Or from the nextjs directory
cd apps/nextjs
pnpm test
```

## Test Structure

- `setup.tsx` - Common test setup for all unit tests
- `app/` - Tests for Next.js app directory components

## Separate from E2E Tests

These unit tests are kept separate from the Playwright E2E tests in the `e2e/` directory.
