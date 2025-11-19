# Logging & Monitoring Setup - RAG-FAB

## 🎯 Übersicht

RAG-FAB nutzt **Sentry** für professionelles Error Tracking und Performance Monitoring. Dies ermöglicht es dir, Fehler in Production sofort zu erkennen und zu beheben.

## 📦 Installierte Tools

### 1. Sentry (Error Tracking & Performance Monitoring)
- **Backend**: `@sentry/node`, `@sentry/profiling-node`
- **Frontend**: `@sentry/nextjs`
- **Kostenlos**: 5.000 Events/Monat
- **Features**:
  - Stack Traces mit Source Maps
  - Performance Monitoring
  - User Context
  - Release Tracking
  - Breadcrumbs

---

## 🔧 Setup-Anleitung

### 1. Sentry Account erstellen

1. Gehe zu [sentry.io](https://sentry.io)
2. Erstelle einen kostenlosen Account
3. Erstelle ein neues Projekt:
   - **Platform**: Node.js (für Backend)
   - **Platform**: Next.js (für Frontend)
4. Kopiere deine **DSN** (Data Source Name)

### 2. Environment Variables setzen

Füge zu deiner `.env` Datei hinzu:

```bash
# Sentry
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
```

### 3. Vercel Environment Variables

Gehe zu deinem Vercel Dashboard → Settings → Environment Variables:

```
SENTRY_DSN = https://...
NEXT_PUBLIC_SENTRY_DSN = https://...
```

---

## 📊 Was wird geloggt?

### Backend (Automatisch)

✅ **API Errors**: Alle 4xx und 5xx Fehler
✅ **Unhandled Exceptions**: Crashes
✅ **Promise Rejections**: Async Fehler
✅ **Performance**: Request Duration, DB Queries
✅ **User Context**: User ID, Email (anonymisiert)

### Frontend (Automatisch)

✅ **JavaScript Errors**: Runtime Errors
✅ **React Errors**: Component Crashes
✅ **API Errors**: Failed Requests
✅ **Performance**: Page Load Time, Web Vitals
✅ **User Actions**: Breadcrumbs

---

## 🔍 Wie du Logs ansehen kannst

### Sentry Dashboard

1. Gehe zu [sentry.io/organizations/your-org/issues/](https://sentry.io)
2. Siehst du alle Errors gruppiert nach:
   - **Frequency**: Wie oft der Fehler auftritt
   - **Users**: Wie viele User betroffen sind
   - **Last Seen**: Wann der Fehler zuletzt auftrat

### Beispiel: Email Filter Error

Wenn der User "Fehler beim Laden der Filter" sieht:

1. Gehe zu Sentry Dashboard
2. Suche nach "email" oder "filters"
3. Klicke auf den Error
4. Du siehst:
   - **Stack Trace**: Wo genau der Fehler ist
   - **Request Data**: API Call Details
   - **User Context**: Welcher User betroffen ist
   - **Breadcrumbs**: Was der User vorher gemacht hat

---

## 🛠️ Manuelles Logging

### Backend - Custom Error Logging

```typescript
import { Sentry } from '../config/sentry';

try {
  // Dein Code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'email-integration',
      provider: 'gmail'
    },
    extra: {
      userId: req.user?.userId,
      emailId: req.params.id
    }
  });
  throw error;
}
```

### Frontend - Custom Error Logging

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Dein Code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'EmailList',
      action: 'fetchFilters'
    }
  });
}
```

### Info/Warning Logging

```typescript
// Backend
Sentry.captureMessage('No Gmail OAuth token found', 'warning');

// Frontend
Sentry.captureMessage('User clicked upgrade button', 'info');
```

---

## 🎯 Best Practices

### 1. Sensitive Data schützen

Sentry filtert automatisch:
- ✅ Authorization Headers
- ✅ Cookies
- ✅ Passwords

**Zusätzlich konfiguriert** (siehe `backend/config/sentry.ts:30-41`):
- User Emails (anonymisiert)
- API Keys

### 2. Error Grouping

Verwende **Tags** für bessere Gruppierung:

```typescript
Sentry.setTag('feature', 'document-upload');
Sentry.setTag('provider', 'gmail');
```

### 3. User Context

```typescript
// Backend
Sentry.setUser({
  id: user.id,
  subscription: user.subscription.plan
  // email wird automatisch entfernt
});

// Frontend
Sentry.setUser({
  id: user.id,
  plan: user.subscription?.plan
});
```

### 4. Breadcrumbs

Breadcrumbs sind automatisch aktiviert, aber du kannst manuelle hinzufügen:

```typescript
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info'
});
```

---

## 📈 Performance Monitoring

### Backend

Sentry tracked automatisch:
- **Request Duration**
- **Database Queries** (wenn konfiguriert)
- **External API Calls**

### Frontend

Sentry tracked automatisch:
- **Page Load Time**
- **Web Vitals** (LCP, FID, CLS)
- **Component Render Time**

---

## 🔔 Alerts konfigurieren

1. Gehe zu Sentry → Alerts
2. Erstelle einen Alert:
   - **Trigger**: Error Rate > 10/min
   - **Action**: Email an dich
3. Bekomme Notifications bei kritischen Fehlern

---

## 🆓 Kostenlose Alternativen

### Wenn du mehr als 5K Events/Monat hast:

**Better Stack (Logtail)** - Log Aggregation
- ✅ Kostenlos: 1GB Logs/Monat
- ✅ Live Tail
- ✅ Search & Filter

Installation:
```bash
npm install @logtail/node @logtail/winston
```

**LogRocket** - Session Replay
- ✅ Kostenlos: 1.000 Sessions/Monat
- ✅ Screen Recording
- ✅ Console Logs

---

## 🚨 Aktuelles Problem: "Fehler beim Laden der Filter"

### Debug-Schritte:

1. **Checke Sentry** (sobald DSN gesetzt ist):
   ```
   Suche nach: "email" oder "filter"
   ```

2. **Checke Browser Console**:
   ```
   F12 → Console Tab
   Siehst du API Fehler?
   ```

3. **Checke Backend Logs** (lokal):
   ```bash
   cd backend && npm run dev
   # Siehst du Errors im Terminal?
   ```

4. **Teste OAuth Token**:
   - Gehe zu MongoDB
   - Finde `OAuthToken` Collection
   - Existiert ein Token für deinen User?

---

## 📝 Zusammenfassung

✅ **Sentry installiert** (Backend + Frontend)
✅ **Error Tracking aktiv**
✅ **Performance Monitoring aktiv**
✅ **Sensitive Data gefiltert**
⏳ **DSN muss noch gesetzt werden**

**Nächster Schritt**: Sentry DSN zu `.env` und Vercel hinzufügen
