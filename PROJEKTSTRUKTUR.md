# RAG-FAB Projektstruktur

Übersicht über die Ordnerstruktur des RAG-FAB Projekts.

## 📁 Hauptverzeichnisse

```
RAG-FAB/
├── 📂 frontend/              # Next.js Frontend
│   ├── 📂 components/        # React-Komponenten
│   │   ├── common/          # Wiederverwendbare UI-Komponenten
│   │   ├── chat/            # Chat-Interface
│   │   ├── upload/          # Dokument-Upload
│   │   ├── auth/            # Authentifizierung
│   │   └── dashboard/       # Dashboard-Komponenten
│   ├── 📂 pages/            # Next.js Pages (Routing)
│   │   ├── api/            # API Routes
│   │   └── dashboard/      # Dashboard-Seiten
│   ├── 📂 styles/           # CSS/SCSS Dateien
│   ├── 📂 hooks/            # Custom React Hooks
│   ├── 📂 utils/            # Utility-Funktionen
│   ├── 📂 services/         # API-Client Services
│   └── 📂 public/           # Statische Assets
│       ├── images/
│       └── icons/
│
├── 📂 backend/              # Serverless Backend
│   ├── 📂 functions/        # Serverless Functions
│   │   ├── auth/           # Authentifizierungs-API
│   │   ├── documents/      # Dokument-Verwaltung
│   │   ├── chat/           # Chat-API
│   │   ├── payment/        # Zahlungsabwicklung
│   │   └── user/           # Benutzerverwaltung
│   ├── 📂 services/         # Business Logic
│   │   ├── rag/            # RAG-System (Retrieve & Generate)
│   │   ├── vectordb/       # Vektor-Datenbank (Pinecone/FAISS)
│   │   ├── ocr/            # OCR-Service (Textract/Vision)
│   │   ├── ai/             # AI/LLM Integration (OpenAI)
│   │   └── storage/        # Cloud-Storage (S3/GCS)
│   ├── 📂 models/           # Datenbank-Modelle
│   ├── 📂 middleware/       # Middleware (Auth, Logging, etc.)
│   ├── 📂 utils/            # Backend-Utilities
│   └── 📂 config/           # Konfigurationen
│
├── 📂 shared/               # Gemeinsamer Code
│   ├── 📂 types/           # TypeScript Type Definitions
│   ├── 📂 constants/       # Konstanten (Plans, Limits, etc.)
│   └── 📂 utils/           # Gemeinsame Utilities
│
├── 📂 scripts/              # Automatisierungs-Scripts
│   ├── 📂 deployment/      # Deployment-Scripts
│   ├── 📂 database/        # Datenbank-Scripts
│   └── 📂 setup/           # Setup-Scripts
│
├── 📂 docs/                 # Dokumentation
│   ├── 📂 architecture/    # Architektur-Docs
│   ├── 📂 api/             # API-Dokumentation
│   └── 📂 user-guide/      # Benutzerhandbuch
│
├── 📂 tests/                # Test-Suite
│   ├── 📂 unit/            # Unit Tests
│   ├── 📂 integration/     # Integrationstests
│   └── 📂 e2e/             # End-to-End Tests
│
├── 📂 config/               # Projekt-Konfigurationen
│
├── 📄 README.md             # Geschäftsidee & Tech-Stack
├── 📄 PROJEKTSTRUKTUR.md    # Diese Datei
└── 📄 LICENSE               # Lizenz
```

## 🎯 Zweck der Hauptverzeichnisse

### Frontend (`/frontend`)
- **Zweck:** Benutzeroberfläche der Plattform
- **Technologie:** Next.js 14+, React, Tailwind CSS
- **Hosting:** Vercel
- **Features:**
  - Dokument-Upload Interface
  - Chat-Interface für AI-Interaktion
  - User Dashboard
  - Authentifizierung (Login/Register)
  - Subscription-Management

### Backend (`/backend`)
- **Zweck:** Serverless API und Business Logic
- **Technologie:** Node.js, Vercel Functions/AWS Lambda
- **Features:**
  - RESTful API Endpoints
  - RAG-System (Retrieval & Generation)
  - Dokumentenverarbeitung (OCR, Chunking, Embedding)
  - AI-Integration (OpenAI GPT)
  - Vektor-Datenbank Integration
  - Authentifizierung & Authorization
  - Payment-Processing (Stripe)

### Shared (`/shared`)
- **Zweck:** Code-Sharing zwischen Frontend und Backend
- **Inhalt:**
  - TypeScript Types
  - Konstanten (Subscription Plans, Limits)
  - Gemeinsame Utilities
  - Validierungslogik

### Scripts (`/scripts`)
- **Zweck:** Automatisierung und DevOps
- **Inhalt:**
  - Deployment-Scripts
  - Datenbank-Migrationen
  - Seed-Scripts
  - Setup-Automatisierung

### Docs (`/docs`)
- **Zweck:** Projektdokumentation
- **Inhalt:**
  - System-Architektur
  - API-Dokumentation
  - Entwickler-Guides
  - Benutzerhandbuch

### Tests (`/tests`)
- **Zweck:** Qualitätssicherung
- **Inhalt:**
  - Unit Tests (Jest)
  - Integration Tests
  - E2E Tests (Playwright/Cypress)

## 🚀 Nächste Schritte

1. **Frontend Setup:**
   - [ ] Next.js Projekt initialisieren
   - [ ] Tailwind CSS konfigurieren
   - [ ] Basis-Komponenten erstellen
   - [ ] Routing aufsetzen

2. **Backend Setup:**
   - [ ] Serverless Functions Struktur erstellen
   - [ ] Datenbank-Schema definieren
   - [ ] OpenAI API Integration
   - [ ] Vektor-Datenbank (Pinecone) einrichten

3. **Shared Setup:**
   - [ ] TypeScript Types definieren
   - [ ] Konstanten für Plans & Limits
   - [ ] API-Contract definieren

4. **DevOps:**
   - [ ] CI/CD Pipeline (GitHub Actions)
   - [ ] Environment Variables Setup
   - [ ] Monitoring & Logging

## 📚 Weitere Informationen

Siehe die jeweiligen README.md Dateien in den Unterverzeichnissen für detaillierte Informationen.
