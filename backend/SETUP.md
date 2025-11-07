# Backend Setup Guide

Anleitung zum Einrichten und Starten des RAG-FAB Backends.

## Voraussetzungen

- Node.js 18+ installiert
- MongoDB Account (MongoDB Atlas oder lokal)
- OpenAI API Key
- Pinecone Account

## Schritt 1: Dependencies installieren

```bash
cd backend
npm install
```

## Schritt 2: Environment Variables einrichten

Erstelle eine `.env` Datei im Root-Verzeichnis (nicht im backend Ordner) basierend auf `.env.example`:

```bash
cp ../.env.example ../.env
```

### Erforderliche Environment Variables:

#### Database
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/rag-fab?retryWrites=true&w=majority
```

**MongoDB Atlas Setup:**
1. Gehe zu https://www.mongodb.com/cloud/atlas
2. Erstelle einen kostenlosen Cluster
3. Erstelle einen Database User
4. Whitelist deine IP oder `0.0.0.0/0` (alle IPs)
5. Kopiere den Connection String

#### OpenAI
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
```

**OpenAI Setup:**
1. Gehe zu https://platform.openai.com/api-keys
2. Erstelle einen neuen API Key
3. Kopiere den Key (wird nur einmal angezeigt!)

#### Pinecone
```env
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=rag-fab-documents
```

**Pinecone Setup:**
1. Gehe zu https://www.pinecone.io/
2. Erstelle einen kostenlosen Account
3. Erstelle einen neuen Index:
   - Name: `rag-fab-documents`
   - Dimensions: `1536` (für OpenAI Embeddings)
   - Metric: `cosine`
4. Kopiere den API Key und Environment

#### JWT Secrets
```env
JWT_SECRET=dein-super-geheimer-jwt-key-mindestens-32-zeichen-lang
JWT_REFRESH_SECRET=dein-super-geheimer-refresh-key-mindestens-32-zeichen-lang
```

**Generiere sichere Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Optional (für später)
```env
# AWS (für S3 und Textract)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-central-1
AWS_S3_BUCKET=rag-fab-documents

# Stripe (für Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Schritt 3: TypeScript kompilieren

```bash
npm run build
```

## Schritt 4: Development Server starten

```bash
npm run dev
```

Der Server läuft nun auf http://localhost:3000

## Schritt 5: Health Check testen

Öffne deinen Browser oder benutze curl:

```bash
curl http://localhost:3000/api/v1/health
```

Erwartete Antwort:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "connected",
      "openai": "configured",
      "pinecone": "configured"
    }
  }
}
```

## API Endpoints testen

### Registrierung
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Max",
    "lastName": "Mustermann"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### Profil abrufen (mit Token)
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Database Connection Error
- Überprüfe ob MongoDB läuft
- Überprüfe die DATABASE_URL
- Bei MongoDB Atlas: IP-Whitelist checken

### OpenAI API Error
- Überprüfe ob OPENAI_API_KEY korrekt ist
- Überprüfe ob Guthaben vorhanden ist

### Pinecone Error
- Überprüfe ob Index erstellt wurde
- Überprüfe Dimensions (muss 1536 sein)
- Überprüfe PINECONE_ENVIRONMENT

## Nächste Schritte

Nach erfolgreichem Setup:

1. ✅ Backend läuft und Health Check funktioniert
2. ✅ Registrierung und Login funktionieren
3. 🔄 Nächster Schritt: Dokument-Upload implementieren
4. 🔄 Danach: RAG-System implementieren
5. 🔄 Dann: Chat-Funktionalität

## Scripts

- `npm run dev` - Development Server mit Auto-Reload
- `npm run build` - TypeScript kompilieren
- `npm start` - Production Server
- `npm test` - Tests ausführen
- `npm run lint` - Code Linting
