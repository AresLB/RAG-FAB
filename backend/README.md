# Backend

Serverless Backend für die RAG-FAB Plattform.

## Struktur

- **functions/** - Serverless Functions (Vercel Functions / AWS Lambda)
  - `auth/` - Authentifizierungs-Endpoints (Login, Register, Token-Refresh)
  - `documents/` - Dokument-Upload, Verarbeitung, Management
  - `chat/` - Chat-API und Anfragen-Handling
  - `payment/` - Zahlungsabwicklung (Stripe Integration)
  - `user/` - Benutzerverwaltung und Profil-Endpoints

- **services/** - Business Logic und Core Services
  - `rag/` - RAG-System (Retrieval & Generation)
    - Dokument-Chunking
    - Embedding-Generierung
    - Similarity Search
    - Answer Generation
  - `vectordb/` - Vektor-Datenbank Integration (Pinecone/FAISS)
  - `ocr/` - OCR-Service (Textract/Google Cloud Vision)
  - `ai/` - AI/LLM Integration (OpenAI GPT, LangChain)
  - `storage/` - Cloud-Storage (S3/Google Cloud Storage)

- **models/** - Datenbank-Modelle und Schemas
  - User, Document, Chat, Subscription, Usage

- **middleware/** - Middleware-Funktionen
  - Authentication
  - Rate Limiting
  - Error Handling
  - Logging

- **utils/** - Utility-Funktionen und Helper

- **config/** - Konfigurationsdateien
  - Database Config
  - API Keys
  - Environment Variables

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Vercel Functions / AWS Lambda
- **Database:** MongoDB (MongoDB Atlas) / PostgreSQL
- **Vector DB:** Pinecone / FAISS
- **AI/LLM:** OpenAI GPT-3.5/4
- **OCR:** AWS Textract / Google Cloud Vision
- **Storage:** AWS S3 / Google Cloud Storage
- **ORM:** Prisma / Mongoose
- **Authentication:** JWT + bcrypt
- **Payment:** Stripe API
