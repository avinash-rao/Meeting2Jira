# Meeting2Jira — Implementation Plan

## Project Scope Summary

A web application that converts Microsoft Teams meeting transcripts into Jira tickets with AI extraction and human review.

**Core Flow:** Upload transcript → AI extracts action items → Review & edit → Create Jira tickets

---

## Phase 0: Repository & Project Setup

### 0.1 GitHub Repository Setup
- [ ] Create new GitHub repository: `meeting2jira`
- [ ] Initialize with README, .gitignore (Node, Angular)
- [ ] Set up branch protection for main
- [ ] Clone repository locally

### 0.2 Project Structure Initialization
```
meeting2jira/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── parsers/
│   │   ├── routes/
│   │   ├── types/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Angular
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   ├── angular.json
│   └── package.json
├── docs/
├── .gitignore
└── README.md
```

---

## Phase 1: Backend Foundation (Day 1 Morning)

### 1.1 Backend Setup
- [ ] Initialize Node.js project with TypeScript
- [ ] Install dependencies: express, cors, multer, dotenv, openai
- [ ] Configure TypeScript (strict mode, ES modules)
- [ ] Set up Express server with CORS
- [ ] Create environment variables structure (.env.example)

### 1.2 Transcript Parsing
- [ ] Install: mammoth (DOCX), custom VTT parser
- [ ] Build VTT parser:
  - Extract timestamps
  - Extract speaker names
  - Extract dialogue text
  - Handle malformed VTT files
- [ ] Build DOCX parser:
  - Extract meeting content
  - Identify speaker patterns
  - Handle various DOCX formats
- [ ] Create unified transcript data model:
```typescript
interface ParsedTranscript {
  speakers: string[];
  entries: TranscriptEntry[];
  metadata: {
    duration?: string;
    date?: string;
  };
}

interface TranscriptEntry {
  timestamp?: string;
  speaker: string;
  text: string;
}
```

### 1.3 File Upload Endpoint
- [ ] Create `/api/upload` endpoint
- [ ] Configure multer for .vtt and .docx files
- [ ] Validate file types and size limits
- [ ] Return parsed transcript data

---

## Phase 2: AI Integration (Day 1 Afternoon)

### 2.1 OpenAI Setup
- [ ] Configure OpenAI API client (GPT-4o)
- [ ] Design extraction prompt:
  - Input: parsed transcript
  - Output: structured action items JSON
- [ ] Define action item schema:
```typescript
interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  confidenceScore: number; // 0-100
  sourceQuote: string;
  timestamp?: string;
}
```

### 2.2 Extraction Service
- [ ] Create `/api/extract` endpoint
- [ ] Implement prompt engineering:
  - Extract action items from transcript
  - Identify assignees from speakers
  - Suggest priorities based on context
  - Calculate confidence scores
  - Include source quotes
- [ ] Handle API errors and retries
- [ ] Test with sample transcripts

---

## Phase 3: Jira Integration (Day 1 Afternoon)

### 3.1 Jira API Setup
- [ ] Install: axios for HTTP requests
- [ ] Create Jira service with basic auth (API token)
- [ ] Implement configuration validation:
```typescript
interface JiraConfig {
  domain: string;        // e.g., "yourcompany.atlassian.net"
  email: string;         // User email
  apiToken: string;      // API token
  projectKey: string;    // e.g., "PROJ"
}
```

### 3.2 Ticket Creation
- [ ] Create `/api/jira/create-tickets` endpoint
- [ ] Implement bulk ticket creation:
  - Default issue type: "Task"
  - Map action items to Jira fields
  - Handle speaker-to-Jira user mapping
- [ ] Error handling for failed creations
- [ ] Return created ticket IDs and URLs

### 3.3 Speaker Mapping
- [ ] Create `/api/jira/users` endpoint to fetch Jira users
- [ ] Implement fuzzy matching for speaker names to Jira users
- [ ] Allow manual mapping override in frontend

---

## Phase 4: Frontend Foundation (Day 2 Morning)

### 4.1 Angular Setup
- [ ] Initialize Angular project (v17+)
- [ ] Install dependencies: Angular Material, RxJS
- [ ] Set up routing structure:
  - `/upload` - File upload page
  - `/review` - Action items review
  - `/settings` - Jira configuration
- [ ] Configure environment files for API URLs

### 4.2 Upload Component
- [ ] Create drag-and-drop file upload UI
- [ ] Support .vtt and .docx files
- [ ] Show upload progress
- [ ] Display parsed transcript preview
- [ ] "Extract Action Items" button
- [ ] Loading state during AI extraction

### 4.3 Review Component
- [ ] Display action items as cards:
  - Title (editable)
  - Description (editable)
  - Assignee dropdown (editable)
  - Priority selector (editable)
  - Due date picker (editable)
  - Confidence score badge
  - Source quote (read-only)
- [ ] Add new item button
- [ ] Remove item button
- [ ] Bulk select/deselect
- [ ] "Create Jira Tickets" button

---

## Phase 5: Integration & Polish (Day 2 Morning/Afternoon)

### 5.1 Jira Configuration
- [ ] Create settings page/modal
- [ ] Form fields:
  - Jira domain
  - Email
  - API token (password field)
  - Project key
- [ ] Test connection button
- [ ] Save configuration (localStorage or backend)

### 5.2 Ticket Creation Flow
- [ ] Connect review page to Jira API
- [ ] Show creation progress
- [ ] Display success/failure for each ticket
- [ ] Show created ticket links
- [ ] Handle partial failures gracefully

### 5.3 Fallback Export
- [ ] Implement CSV export:
  - All action item fields
  - Download as `action-items-{date}.csv`
- [ ] Implement JSON export:
  - Structured action items
  - Download as `action-items-{date}.json`

### 5.4 Error Handling & UX
- [ ] Add loading spinners
- [ ] Toast notifications for success/error
- [ ] Form validation
- [ ] Empty states
- [ ] Responsive design (mobile-friendly)
- [ ] Accessibility (ARIA labels, keyboard navigation)

---

## Phase 6: Testing & Deployment (Day 2 Afternoon)

### 6.1 End-to-End Testing
- [ ] Test with sample .vtt transcript
- [ ] Test with sample .docx transcript
- [ ] Test AI extraction accuracy
- [ ] Test Jira ticket creation
- [ ] Test edit functionality
- [ ] Test CSV/JSON export
- [ ] Test error scenarios

### 6.2 Deployment Preparation
- [ ] Create Vercel configuration (frontend):
  - `vercel.json`
  - Environment variables for API URL
- [ ] Create Render configuration (backend):
  - `render.yaml`
  - Environment variables for OpenAI API key
  - CORS configuration for Vercel domain

### 6.3 Deploy to Production
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Test deployed application end-to-end
- [ ] Fix any deployment issues

### 6.4 Demo Preparation
- [ ] Prepare sample transcript files
- [ ] Create demo Jira project
- [ ] Write demo script (30-second flow)
- [ ] Practice demo presentation
- [ ] Prepare backup (local version)

---

## Phase 7: Stretch Goals (If Time Permits)

### 7.1 Engineering Analysis Agent
- [ ] Add GitHub repo connection UI
- [ ] Implement GitHub OAuth or PAT authentication
- [ ] Fetch repository structure
- [ ] Analyze codebase:
  - File/module mapping
  - API endpoint identification
  - Dependency analysis
- [ ] Create engineering impact prompt for LLM
- [ ] Display engineering context in review UI
- [ ] Enrich Jira ticket descriptions with:
  - Impacted modules
  - Affected APIs
  - Testing requirements
  - Complexity rating

---

## Technical Architecture

### System Architecture
```
┌─────────────┐
│   Browser   │
│  (Angular)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│   Vercel    │
│  (Frontend) │
└──────┬──────┘
       │ API Calls
       ▼
┌─────────────┐      ┌──────────────┐
│   Render    │─────▶│  OpenAI API  │
│  (Backend)  │      │   (GPT-4o)   │
└──────┬──────┘      └──────────────┘
       │
       ▼
┌─────────────┐
│  Jira API   │
│   (REST)    │
└─────────────┘
```

### Data Flow
```
1. Upload .vtt/.docx → Backend parses → Returns transcript
2. Frontend sends transcript → Backend calls OpenAI → Returns action items
3. User reviews/edits → Frontend sends to Jira API → Tickets created
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload and parse transcript |
| POST | `/api/extract` | Extract action items with AI |
| POST | `/api/jira/create-tickets` | Bulk create Jira tickets |
| GET | `/api/jira/users` | Fetch Jira users for mapping |
| POST | `/api/jira/test-connection` | Validate Jira credentials |

---

## Environment Variables

### Backend (.env)
```
PORT=3000
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://meeting2jira.vercel.app
NODE_ENV=production
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://meeting2jira.onrender.com'
};
```

---

## Success Criteria

- ✅ Upload .vtt and .docx transcripts
- ✅ AI extracts action items with 80%+ accuracy
- ✅ Review UI allows full editing
- ✅ Jira tickets created successfully
- ✅ Deployed and accessible online
- ✅ 30-second demo works flawlessly
- 🎯 Engineering Analysis Agent (bonus)

---

## Timeline

| Time | Phase | Deliverable |
|------|-------|-------------|
| Day 1 AM | Setup + Parsing | Backend running, transcripts parsed |
| Day 1 PM | AI + Jira | Action items extracted, Jira integration working |
| Day 2 AM | Frontend | Upload + Review UI complete |
| Day 2 PM | Deploy + Polish | Live application, demo ready |
| Extra | Stretch | Engineering Agent (if time) |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| OpenAI API rate limits | Implement retry logic, use caching |
| Jira API authentication issues | Test early, provide clear error messages |
| Deployment delays | Have local version ready as backup |
| Transcript parsing failures | Handle edge cases, provide manual input option |
| Time constraints | Prioritize core features, defer stretch goals |

---

## Next Steps

1. ✅ Create GitHub repository
2. Initialize project structure
3. Start Phase 1: Backend Foundation