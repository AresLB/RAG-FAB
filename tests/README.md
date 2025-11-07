# Tests

Test-Suite für RAG-FAB.

## Struktur

- **unit/** - Unit Tests
  - Frontend-Komponenten
  - Backend-Services
  - Utility-Funktionen

- **integration/** - Integrationstests
  - API-Endpoints
  - Datenbank-Operationen
  - Service-Integration

- **e2e/** - End-to-End Tests
  - User-Flows
  - UI-Tests
  - Complete Workflows

## Test-Framework

- **Frontend:** Jest + React Testing Library
- **Backend:** Jest + Supertest
- **E2E:** Playwright / Cypress

## Ausführung

```bash
# Alle Tests
npm test

# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# Coverage Report
npm run test:coverage
```
