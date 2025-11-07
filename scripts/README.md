# Scripts

Automatisierungs- und Deployment-Scripts für RAG-FAB.

## Struktur

- **deployment/** - Deployment-Scripts
  - `deploy-frontend.sh` - Frontend auf Vercel deployen
  - `deploy-backend.sh` - Backend-Functions deployen
  - `setup-env.sh` - Environment Variables einrichten

- **database/** - Datenbank-Scripts
  - `seed.js` - Datenbank mit Test-Daten befüllen
  - `migrate.js` - Datenbank-Migrationen
  - `backup.sh` - Backup-Script

- **setup/** - Setup-Scripts
  - `install.sh` - Dependencies installieren
  - `init-db.sh` - Datenbank initialisieren
  - `setup-vectordb.sh` - Vektor-Datenbank einrichten

## Verwendung

```bash
# Projekt Setup
./scripts/setup/install.sh

# Development
npm run dev

# Deployment
./scripts/deployment/deploy-frontend.sh
./scripts/deployment/deploy-backend.sh
```
