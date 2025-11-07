# Frontend

Next.js-basiertes Frontend für die RAG-FAB Plattform.

## Struktur

- **components/** - React-Komponenten
  - `common/` - Wiederverwendbare UI-Komponenten (Button, Input, Card, etc.)
  - `chat/` - Chat-Interface und Chatbot-Komponenten
  - `upload/` - Dokument-Upload UI und Drag & Drop
  - `auth/` - Login, Registrierung, Passwort-Reset
  - `dashboard/` - Dashboard-spezifische Komponenten

- **pages/** - Next.js Pages (File-based Routing)
  - `api/` - API Routes für Next.js
  - `dashboard/` - Dashboard-Seiten

- **styles/** - Global Styles und CSS-Module

- **hooks/** - Custom React Hooks
  - Beispiel: `useAuth`, `useChat`, `useDocuments`

- **utils/** - Utility-Funktionen und Helper

- **services/** - API-Client und Services für Backend-Kommunikation
  - `api.ts` - Axios/Fetch Wrapper
  - `auth.service.ts` - Authentifizierung
  - `documents.service.ts` - Dokumenten-Upload/-Management
  - `chat.service.ts` - Chat-API

- **public/** - Statische Assets (Bilder, Icons, Fonts)

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS / CSS Modules
- **State Management:** React Context / Zustand
- **Forms:** React Hook Form
- **API Client:** Axios
- **UI Library:** shadcn/ui / Radix UI
