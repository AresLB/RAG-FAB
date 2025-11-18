# RAG-FAB - AI Email Assistant Platform

## 🎯 Vision & Problem Statement

### Das Problem
Professionelle Dienstleister (Makler, Kundensupport, Berater) erhalten täglich viele ähnliche Anfragen per Email. Die Beantwortung ist zeitaufwendig, wiederholt sich oft und erfordert Zugriff auf spezifisches Wissen (Produktkataloge, Preislisten, FAQs, etc.).

### Die Lösung
RAG-FAB ist eine AI-gestützte Email-Assistenz-Plattform, die:
1. **Email-Postfächer** (Gmail, Outlook) mit AI verbindet
2. **Wissensdatenbank** aus hochgeladenen Dokumenten erstellt (RAG)
3. **Automatische Email-Drafts** generiert basierend auf der Wissensdatenbank
4. **Kontrolle beim User** lässt - er prüft und sendet die Emails selbst

### Beispiel Use Case: Immobilien-Makler
```
Eingehende Email:
"Hallo, ich interessiere mich für die 3-Zimmer-Wohnung in der Hauptstraße 15.
Ist sie noch verfügbar? Was kostet die Kaution?"

AI Draft (basierend auf hochgeladenen Exposés):
"Guten Tag,

vielen Dank für Ihr Interesse an der 3-Zimmer-Wohnung in der Hauptstraße 15, München.

Die Wohnung ist noch verfügbar. Hier die wichtigsten Eckdaten:
- Kaltmiete: 1.450 € / Monat
- Kaution: 4.350 € (3 Monatsmieten)
- Verfügbar ab: 01.03.2025
- Größe: 75 qm, 3. OG mit Aufzug

Gerne vereinbare ich einen Besichtigungstermin mit Ihnen.
Welche Termine würden Ihnen diese Woche passen?

Beste Grüße"
```

Der Makler **prüft und sendet** den Draft selbst - volle Kontrolle!

---

## 🔐 Vertrauen & Datenschutz (KRITISCH!)

### Warum Vertrauen das größte Problem ist
- User haben **berechtigte Bedenken**, dass AI alle Emails liest
- Geschäftliche Emails enthalten **sensible Daten**
- **DSGVO-Konformität** ist Pflicht in Europa
- Fehlende Kontrolle → User fühlen sich unwohl

### Lösungsansatz: Maximale User-Kontrolle

#### ✅ MVP-Lösung: Label/Ordner-basierte Filter
**Wie es funktioniert:**
1. User erstellt in Gmail ein Label "AI-Assistent" (oder in Outlook einen Ordner)
2. Nur Emails in diesem Label werden verarbeitet
3. User entscheidet **manuell**, welche Emails die AI sehen darf
4. Alle anderen Emails werden **nicht** geladen oder verarbeitet

**Vorteile:**
- ✅ Maximale Kontrolle
- ✅ Einfach zu verstehen
- ✅ DSGVO-freundlich (explizite Auswahl)
- ✅ Keine false positives

**Implementation:**
- Gmail: `GET /gmail/v1/users/me/messages?labelIds=LABEL_AI_ASSISTANT`
- Outlook: `GET /me/mailFolders/{folderId}/messages`

#### 🔮 Post-MVP: Erweiterte Filter
Später kannst du zusätzliche Filter anbieten:
1. **Whitelist** - Nur bestimmte Absender (z.B. nur Kunden-Domain)
2. **Keyword-Filter** - Nur Emails mit Wörtern wie "Besichtigung", "Angebot"
3. **Betreff-Muster** - RegEx für bestimmte Betreff-Zeilen
4. **Zeitbasiert** - Nur Emails nach bestimmtem Datum

#### 🛡️ Datenschutz-Best Practices
1. **Keine permanente Speicherung** von Email-Inhalten
   - Nur temporär im RAM für Draft-Generierung
   - Alternativ: Verschlüsselt speichern mit User-Key
2. **OAuth Scopes minimieren**
   - `gmail.readonly` statt `gmail.modify`
   - Nur notwendige Permissions
3. **Transparenz-Dashboard**
   - User sieht, welche Emails verarbeitet wurden
   - Lösch-Funktion für verarbeitete Daten
4. **EU-Server** für DSGVO
5. **Opt-in, nicht Opt-out**

---

## 🏗️ MVP Feature-Liste (Priorität 1)

### 1. ✅ OAuth Integration (DONE)
- [x] Google OAuth Login
- [x] Microsoft OAuth Login
- [x] User Account Creation
- [x] Token Storage

### 2. 📧 Email Integration
**Status:** TODO
**Geschätzte Zeit:** 3-4 Tage

#### 2.1 Gmail Integration
- [ ] Label-basierte Email-Filterung
- [ ] Email-Liste auf Dashboard anzeigen
- [ ] Email-Details abrufen (Betreff, Absender, Body)
- [ ] Ungelesene Emails markieren

#### 2.2 Outlook Integration
- [ ] Ordner-basierte Email-Filterung
- [ ] Email-Liste auf Dashboard anzeigen
- [ ] Email-Details abrufen

#### 2.3 Dashboard Email-Ansicht
```
┌─────────────────────────────────────────────┐
│ Postfach: max@makler.de (Gmail)             │
│ Filter: Label "AI-Assistent"                │
├─────────────────────────────────────────────┤
│ [●] Neue Anfrage - 3-Zi Wohnung Hauptstr.   │
│     Von: kunde@email.com | vor 2 Std        │
│     [Draft generieren]                      │
├─────────────────────────────────────────────┤
│ [●] Besichtigungstermin Anfrage             │
│     Von: interessent@web.de | vor 5 Std     │
│     [Draft generieren]                      │
└─────────────────────────────────────────────┘
```

### 3. 📄 Dokumenten-Management (RAG Core)
**Status:** TODO
**Geschätzte Zeit:** 5-6 Tage

#### 3.1 Dokumente hochladen
- [ ] Drag & Drop Upload
- [ ] Unterstützte Formate: PDF, DOCX, TXT, MD
- [ ] Datei-Größen-Limit (z.B. 10 MB pro File)
- [ ] Multiple Files gleichzeitig

#### 3.2 Dokumenten-Verarbeitung
- [ ] Text-Extraktion (PDF Parser, DOCX Parser)
- [ ] Chunking (Split in kleinere Abschnitte)
- [ ] Embedding-Generierung (OpenAI Embeddings / Cohere)
- [ ] Vector Storage (Pinecone, Weaviate, oder lokale Lösung)

#### 3.3 Dokumenten-Verwaltung
- [ ] Dokumenten-Liste anzeigen
  ```
  ┌─────────────────────────────────────────────┐
  │ Meine Dokumente (3/10 verwendet)            │
  ├─────────────────────────────────────────────┤
  │ 📄 Exposé_Hauptstr15.pdf                    │
  │    Hochgeladen: 12.01.2025 | 245 KB         │
  │    [Löschen] [Download]                     │
  ├─────────────────────────────────────────────┤
  │ 📄 Preisliste_2025.docx                     │
  │    Hochgeladen: 10.01.2025 | 89 KB          │
  │    [Löschen] [Download]                     │
  └─────────────────────────────────────────────┘
  ```
- [ ] Dokument löschen (auch Embeddings!)
- [ ] Dokument-Kategorien/Tags (z.B. "Wohnungen", "Preise", "FAQ")
- [ ] Vorschau-Funktion

#### 3.4 RAG Pipeline
```
User Email → Embedding → Similarity Search → Top-K Dokumente → Context für LLM
```

### 4. 🤖 AI Draft-Generierung
**Status:** TODO
**Geschätzte Zeit:** 4-5 Tage

#### 4.1 Email-Analyse
- [ ] Intent-Detection (Was will der Kunde?)
- [ ] Entity-Extraction (Welche Wohnung? Welcher Preis?)

#### 4.2 RAG-basierte Antwort
- [ ] Relevante Dokumente finden (Vector Search)
- [ ] Kontext zusammenstellen (Top 3-5 Chunks)
- [ ] LLM Prompt Engineering
  ```
  System: Du bist ein professioneller Email-Assistent für Immobilien-Makler.

  Context aus Dokumenten:
  {retrieved_chunks}

  Eingehende Email:
  {incoming_email}

  Aufgabe: Erstelle einen höflichen, professionellen Antwort-Entwurf basierend
  AUSSCHLIESSLICH auf den bereitgestellten Dokumenten. Erfinde KEINE Informationen.
  ```

#### 4.3 Draft-Vorschau & Editing
- [ ] Draft in Modal/Seitenleiste anzeigen
- [ ] Inline-Editing ermöglichen
- [ ] "Regenerieren"-Button
- [ ] "Kopieren"-Button
- [ ] "In Gmail/Outlook öffnen"-Button (Deeplink)

#### 4.4 Confidence Score (Nice-to-have)
- [ ] Zeige an, wie sicher die AI ist (z.B. "85% Confidence")
- [ ] Warnung bei niedriger Confidence

### 5. ⚙️ Einstellungen & Konfiguration
**Status:** TODO
**Geschätzte Zeit:** 2-3 Tage

#### 5.1 Email-Filter Setup
- [ ] Label/Ordner auswählen
- [ ] Whitelist/Blacklist (Post-MVP)
- [ ] Preview: Wie viele Emails würden verarbeitet?

#### 5.2 AI-Einstellungen
- [ ] Ton/Stil auswählen (Formal, Casual, Freundlich)
- [ ] Sprache (Deutsch, Englisch)
- [ ] Signatur hinzufügen

#### 5.3 Subscription Management
- [ ] Aktuellen Plan anzeigen
- [ ] Upgrade-Option
- [ ] Usage Stats (Emails verarbeitet, Dokumente verwendet)

---

## 🚀 Implementierungsplan (Step-by-Step)

### Phase 1: Email Integration (Woche 1-2)
**Ziel:** Emails auf Dashboard anzeigen

#### Step 1.1: Gmail API Integration
```typescript
// backend/services/integrations/gmail-service.ts
class GmailService {
  async getFilteredEmails(userId: string, labelName: string) {
    // 1. Get user's OAuth token
    // 2. Find label ID by name
    // 3. Fetch emails with labelIds filter
    // 4. Return email list
  }

  async getEmailDetails(userId: string, emailId: string) {
    // Parse email headers, body, attachments
  }
}
```

**Tests:**
1. User erstellt Gmail Label "AI-Assistent"
2. Verschiebt 2-3 Test-Emails in Label
3. Dashboard zeigt diese Emails an
4. Klick auf Email zeigt Details

#### Step 1.2: Outlook API Integration
Analog zu Gmail

#### Step 1.3: Dashboard UI
- Email-Liste Component
- Email-Detail Modal
- Polling/Webhooks für neue Emails (später)

---

### Phase 2: Dokumenten-Management (Woche 2-3)
**Ziel:** User kann Dokumente hochladen und verwalten

#### Step 2.1: Upload Backend
```typescript
// backend/routes/documents.routes.ts
POST /api/v1/documents/upload
- Multipart file upload
- File validation (type, size)
- Storage (S3, local filesystem)
- Database entry

GET /api/v1/documents
- List user's documents

DELETE /api/v1/documents/:id
- Remove file + DB entry + embeddings
```

#### Step 2.2: Text-Extraktion
```typescript
// backend/services/document-processor.ts
class DocumentProcessor {
  async extractText(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
      return this.extractFromPDF(file);
    }
    // ... andere Formate
  }
}
```

**Libraries:**
- PDF: `pdf-parse` oder `pdfjs-dist`
- DOCX: `mammoth`
- TXT: native Node.js

#### Step 2.3: Chunking
```typescript
class ChunkingService {
  chunkText(text: string, chunkSize = 500): string[] {
    // Split by paragraphs, sentences
    // Keep chunk size ~500-1000 chars
    // Overlap 50-100 chars between chunks
  }
}
```

#### Step 2.4: Embedding & Vector Storage
```typescript
class EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    // OpenAI Embeddings API
    // oder Cohere
    // oder lokales Modell (sentence-transformers)
  }

  async storeEmbedding(
    documentId: string,
    chunkId: string,
    embedding: number[],
    text: string
  ) {
    // Vector DB: Pinecone, Weaviate, Qdrant
    // oder PostgreSQL mit pgvector Extension
  }
}
```

**Empfehlung für MVP:** PostgreSQL mit `pgvector` Extension
- ✅ Einfach zu setup
- ✅ Kein extra Service
- ✅ Kostenlos
- ❌ Skaliert schlechter als Pinecone (aber für MVP ok)

#### Step 2.5: Frontend Upload UI
```tsx
// components/DocumentUpload.tsx
<Dropzone
  onDrop={handleUpload}
  accept={{ 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] }}
>
  Drag & Drop oder Klicken zum Hochladen
</Dropzone>

// components/DocumentList.tsx
<Table>
  <DocumentRow
    name="Exposé.pdf"
    size="245 KB"
    date="12.01.2025"
    onDelete={handleDelete}
  />
</Table>
```

**Tests:**
1. Upload PDF → Text extrahiert → Chunks erstellt → Embeddings gespeichert
2. Dokumenten-Liste zeigt File an
3. Löschen entfernt File + DB + Embeddings
4. Subscription Limit wird respektiert (Free: 1 Dok, Pro: unlimited)

---

### Phase 3: RAG Pipeline & Draft-Generierung (Woche 3-4)
**Ziel:** AI generiert Email-Drafts basierend auf Dokumenten

#### Step 3.1: Similarity Search
```typescript
class RAGService {
  async findRelevantChunks(query: string, topK = 5): Promise<Chunk[]> {
    // 1. Generate embedding for query (incoming email)
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // 2. Cosine similarity search in vector DB
    const results = await this.vectorDB.search(queryEmbedding, topK);

    return results;
  }
}
```

#### Step 3.2: LLM Draft-Generierung
```typescript
class DraftService {
  async generateDraft(
    incomingEmail: Email,
    userId: string
  ): Promise<string> {
    // 1. Find relevant chunks
    const chunks = await this.ragService.findRelevantChunks(
      incomingEmail.body,
      5
    );

    // 2. Build prompt
    const prompt = this.buildPrompt(incomingEmail, chunks);

    // 3. Call LLM (OpenAI GPT-4, Claude, etc.)
    const draft = await this.llmService.generate(prompt);

    return draft;
  }

  buildPrompt(email: Email, chunks: Chunk[]): string {
    return `
Du bist ein professioneller Email-Assistent.

KONTEXT AUS DOKUMENTEN:
${chunks.map(c => c.text).join('\n\n')}

EINGEHENDE EMAIL:
Von: ${email.from}
Betreff: ${email.subject}
Nachricht:
${email.body}

AUFGABE:
Erstelle einen höflichen, professionellen Antwort-Entwurf.
Verwende AUSSCHLIESSLICH Informationen aus dem bereitgestellten Kontext.
Erfinde KEINE Details.
Wenn Informationen fehlen, bitte höflich um Details.

ANTWORT:
    `;
  }
}
```

**LLM-Auswahl:**
- **OpenAI GPT-4o**: Beste Qualität, teuer (~$0.01/1K tokens)
- **Claude 3.5 Sonnet**: Sehr gut, günstiger
- **GPT-4o-mini**: Günstiger, gute Qualität für MVP
- **Lokales Modell**: Llama 3, Mistral (komplexer, aber kostenlos)

**Empfehlung MVP:** GPT-4o-mini oder Claude Sonnet

#### Step 3.3: Frontend Draft UI
```tsx
// components/EmailDraftGenerator.tsx
<Modal>
  <EmailPreview email={incomingEmail} />

  <DraftSection>
    {isGenerating ? <Spinner /> : (
      <Textarea value={draft} onChange={setDraft} />
    )}

    <ButtonGroup>
      <Button onClick={regenerate}>🔄 Regenerieren</Button>
      <Button onClick={copy}>📋 Kopieren</Button>
      <Button onClick={openInGmail}>📧 In Gmail öffnen</Button>
    </ButtonGroup>
  </DraftSection>
</Modal>
```

**Tests:**
1. Email mit Frage zu hochgeladenem Dokument
2. AI findet relevante Chunks
3. Draft enthält korrekte Informationen
4. User kann Draft bearbeiten
5. "In Gmail öffnen" erstellt Draft in Gmail

---

### Phase 4: Polish & Testing (Woche 4-5)
**Ziel:** MVP ist produktionsreif

#### 4.1 Error Handling
- [ ] LLM API Fehler (Rate Limit, Timeout)
- [ ] OAuth Token Refresh
- [ ] File Upload Fehler
- [ ] Vector Search Fehler

#### 4.2 Performance
- [ ] Email-Liste Pagination
- [ ] Lazy Loading für Dokumente
- [ ] Caching für Embeddings
- [ ] Background Jobs für Document Processing

#### 4.3 UI/UX Polish
- [ ] Loading States
- [ ] Empty States
- [ ] Error Messages (user-friendly)
- [ ] Responsive Design
- [ ] Dark Mode (optional)

#### 4.4 Testing
- [ ] Unit Tests (Backend Services)
- [ ] Integration Tests (API Endpoints)
- [ ] E2E Tests (User Flows)
- [ ] Manual Testing mit echten Emails

---

## 🎨 Erweiterte Ideen (Post-MVP)

### 1. Learning from Edits
**Problem:** User ändert oft die AI-Drafts
**Lösung:** Speichere Edits und fine-tune das Modell

```typescript
// Wenn User Draft bearbeitet und sendet
await trackEdit({
  originalDraft: aiDraft,
  finalDraft: userEditedDraft,
  emailContext: incomingEmail
});

// Später: Fine-tuning
await fineTuneModel(userId, edits);
```

**Benefits:**
- AI lernt User's Stil
- Weniger Edits nötig über Zeit
- Personalisierte AI

### 2. Multi-Mailbox Support
User kann mehrere Postfächer verbinden:
- `max@makler.de` (Geschäft)
- `info@firma.de` (Support)

Jedes Postfach hat eigene Dokumente und Einstellungen.

### 3. Team Collaboration
- Mehrere User teilen sich Postfach
- Approval-Workflow (Junior erstellt Draft → Senior genehmigt)
- Analytics für Team

### 4. Advanced Filtering
- AI kategorisiert Emails automatisch
- User kann Regeln erstellen: "Besichtigungs-Anfragen → Auto-Draft"
- Priority Inbox

### 5. Template System
User erstellt Templates für häufige Szenarien:
- "Besichtigungstermin"
- "Absage"
- "Preis-Anfrage"

AI wählt passendes Template.

### 6. Analytics Dashboard
```
┌─────────────────────────────────────────────┐
│ Diesen Monat                                │
├─────────────────────────────────────────────┤
│ 📧 127 Emails verarbeitet                   │
│ ⚡ 95 Drafts generiert                      │
│ ⏱️ ~6.3 Stunden gespart                     │
│ ✅ 89% Drafts direkt verwendet              │
└─────────────────────────────────────────────┘
```

### 7. Mobile App
React Native App für unterwegs.

### 8. Integrations
- Slack Notifications
- Zapier Integration
- CRM Integration (HubSpot, Salesforce)

---

## 🏛️ Tech Stack Empfehlung

### Frontend
- ✅ **Next.js 14** (bereits verwendet)
- ✅ **TypeScript**
- ✅ **Tailwind CSS**
- **shadcn/ui** für Components (modern, accessible)
- **React Query** für Data Fetching
- **Zustand** für State Management

### Backend
- ✅ **Node.js + Express** (bereits verwendet)
- ✅ **TypeScript**
- ✅ **MongoDB** (User, Subscriptions)
- **PostgreSQL + pgvector** (für Embeddings/RAG)
  - Alternative: Nutze nur MongoDB + externe Vector DB
- **Bull** für Background Jobs (Document Processing)
- **Redis** für Caching

### AI & RAG
- **OpenAI API** (GPT-4o-mini für MVP, GPT-4o für Production)
- **OpenAI Embeddings** (`text-embedding-3-small`)
- **LangChain** (optional, für RAG Pipeline)
- **PostgreSQL pgvector** oder **Pinecone** für Vector Storage

### Infrastructure
- ✅ **Vercel** für Frontend + Backend Functions
- **Vercel Postgres** für PostgreSQL (einfach!)
- **Vercel Blob** für File Storage
- **Upstash Redis** für Caching (Vercel Integration)

### Monitoring
- **Sentry** für Error Tracking
- **PostHog** für Analytics
- **Vercel Analytics** für Performance

---

## 🔒 Sicherheit & Compliance

### DSGVO-Konformität
1. **Datensparsamkeit**: Nur notwendige Email-Daten laden
2. **Lösch-Funktion**: User kann alle Daten löschen
3. **Transparenz**: Zeige an, welche Daten gespeichert werden
4. **Consent**: Explizite Zustimmung bei Signup
5. **EU-Server**: Nutze Vercel Frankfurt Region

### OAuth Security
1. **Minimal Scopes**: Nur `readonly` + `compose` für Emails
2. **Token Encryption**: Verschlüssele OAuth Tokens in DB
3. **Token Refresh**: Automatisches Refresh bei Ablauf

### API Security
1. **Rate Limiting**: Schütze vor Abuse
2. **Input Validation**: Sanitize user inputs
3. **SQL Injection Prevention**: Use parameterized queries
4. **XSS Prevention**: Sanitize email HTML

---

## 💰 Pricing-Strategie (Empfehlung)

### Free Tier
- 1 Postfach
- 3 Dokumente (max 5 MB total)
- 10 Drafts/Monat
- Community Support

### Pro Tier (19€/Monat)
- 3 Postfächer
- Unlimited Dokumente (max 100 MB total)
- Unlimited Drafts
- Email Support
- Advanced Filters

### Business Tier (49€/Monat)
- Unlimited Postfächer
- Unlimited Dokumente (max 500 MB total)
- Unlimited Drafts
- Priority Support
- Team Collaboration
- Custom Templates
- Analytics

### Enterprise (Custom)
- On-Premise Deployment
- Custom Model Training
- SLA
- Dedicated Support

---

## 📊 Success Metrics (KPIs)

### Product Metrics
1. **Draft Acceptance Rate**: Wie viele Drafts werden ohne Edit gesendet?
2. **Time Saved**: Durchschnittliche Zeitersparnis pro Email
3. **Document Upload Rate**: Wie viele User laden Dokumente hoch?
4. **Daily Active Users**: Wie viele User nutzen es täglich?

### Business Metrics
1. **Conversion Rate**: Free → Pro
2. **Churn Rate**: Wie viele kündigen?
3. **Customer Lifetime Value (CLV)**
4. **Customer Acquisition Cost (CAC)**

### Technical Metrics
1. **Draft Generation Time**: Ziel < 5 Sekunden
2. **RAG Accuracy**: Wie oft sind die Infos korrekt?
3. **API Uptime**: Ziel > 99.5%

---

## 🚦 MVP Checkliste

### Must-Have (für Launch)
- [ ] OAuth Login (Google + Microsoft) ✅
- [ ] Email-Liste laden (mit Label/Ordner-Filter)
- [ ] Email-Details anzeigen
- [ ] Dokumente hochladen (PDF, DOCX, TXT)
- [ ] Dokumenten-Liste + Löschen
- [ ] RAG Pipeline (Embedding + Vector Search)
- [ ] Draft-Generierung
- [ ] Draft bearbeiten + kopieren
- [ ] Subscription Limits enforced
- [ ] Responsive UI
- [ ] Error Handling

### Nice-to-Have (kann warten)
- [ ] "In Gmail öffnen"-Button
- [ ] Confidence Score
- [ ] Template System
- [ ] Analytics
- [ ] Learning from Edits
- [ ] Mobile App

### Pre-Launch
- [ ] Security Audit
- [ ] DSGVO-Compliance Check
- [ ] Beta Testing (5-10 Users)
- [ ] Performance Testing
- [ ] Documentation (User Guides)

---

## 🤝 Meine Empfehlungen

### 1. Starte mit Label/Ordner-Filter (WICHTIG!)
Das ist der **Killer-Feature** für Vertrauen. User haben **volle Kontrolle**, welche Emails verarbeitet werden. Marketing-Tipp: Hebe das überall hervor!

### 2. Fokus auf Qualität, nicht Quantität
Lieber **weniger Features**, aber **sehr gut implementiert**. Ein perfekt funktionierender Draft-Generator ist besser als 10 halbfertige Features.

### 3. Transparenz = Vertrauen
Zeige dem User **immer**:
- Welche Emails wurden verarbeitet?
- Welche Dokumente wurden verwendet?
- Warum wurde dieser Draft erstellt?

### 4. Preview-Modus für Launch
Starte mit einem **"Preview Mode"**-Banner:
```
⚠️ Beta-Phase: Bitte prüfe alle Drafts sorgfältig, bevor du sie sendest.
```

Das gibt dir Sicherheit und User fühlen sich involviert.

### 5. Lokale Alternative erwägen (später)
Für Enterprise-Kunden könnte ein **selbst-gehostetes Modell** interessant sein (z.B. Llama 3). Dann bleiben **alle Daten on-premise**.

### 6. Feedback-Loop von Anfang an
Baue einen **"War dieser Draft hilfreich?"** Button ein. Das gibt dir wertvolle Insights.

### 7. Nischen-Marketing
Fokus auf **eine Zielgruppe** für MVP:
- Immobilien-Makler (dein Beispiel)
- Oder: Handwerker
- Oder: Coaches/Berater

Erst wenn das perfekt funktioniert, expandiere.

### 8. Community aufbauen
Erstelle eine **Discord/Slack Community** für Early Adopters. Die geben dir die besten Feature-Ideen!

---

## ❓ Offene Fragen für dich

1. **Vector DB**: PostgreSQL (pgvector) oder externe Lösung (Pinecone)?
   - Empfehlung: Postgres für MVP (einfacher)

2. **LLM Provider**: OpenAI, Claude, oder lokales Modell?
   - Empfehlung: OpenAI GPT-4o-mini für MVP (beste Kosten/Nutzen)

3. **File Storage**: Vercel Blob, AWS S3, oder lokal?
   - Empfehlung: Vercel Blob (nahtlose Integration)

4. **Monitoring**: Welches Budget für Tools?
   - Free Tiers nutzen: Sentry (10K events), PostHog (1M events)

5. **Beta-Testing**: Hast du schon potentielle Tester?

---

## 🎯 Nächster Schritt: Los geht's!

Ich empfehle, mit **Phase 1 (Email Integration)** zu starten:

1. **Step 1.1**: Gmail API - Emails mit Label-Filter laden
2. **Step 1.2**: Dashboard UI - Email-Liste anzeigen
3. **Step 1.3**: Email-Details Modal

**Geschätzte Zeit:** 3-4 Tage

Soll ich direkt mit der Implementation starten? Welche Phase willst du zuerst angehen?

---

**Autor:** Claude (AI Assistant)
**Datum:** 18.11.2025
**Version:** 1.0 (MVP Planning)
