# Shared

Gemeinsam genutzte Code-Module zwischen Frontend und Backend.

## Struktur

- **types/** - TypeScript Type Definitions
  - `user.types.ts` - User, Auth, Profile
  - `document.types.ts` - Document, Upload, Metadata
  - `chat.types.ts` - Message, Conversation, Response
  - `subscription.types.ts` - Plan, Payment, Usage
  - `api.types.ts` - API Request/Response Types

- **constants/** - Gemeinsame Konstanten
  - `plans.ts` - Subscription Plans (Free, Basic, Pro)
  - `limits.ts` - Usage Limits (Fragen pro Monat, Dokumente, etc.)
  - `api-routes.ts` - API-Endpoint Konstanten
  - `errors.ts` - Error Codes und Messages

- **utils/** - Gemeinsame Utility-Funktionen
  - Validierung
  - Formatierung
  - Helper-Funktionen

## Verwendung

Diese Module können sowohl im Frontend als auch im Backend importiert werden:

```typescript
import { User, Document } from '@shared/types';
import { PLANS, LIMITS } from '@shared/constants';
```
