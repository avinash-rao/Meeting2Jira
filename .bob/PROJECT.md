# Meeting2Jira — Project Scope Summary

## What We're Building (MVP - Core Features)

A web application that automates the process of converting Microsoft Teams meeting transcripts into Jira tickets with AI assistance and human review.

### Core User Journey
1. **Upload** Teams transcript (.vtt or .docx file)
2. **AI extracts** action items automatically with metadata
3. **Review & edit** extracted items in an interactive UI
4. **Create** Jira tickets with one click

---

## In-Scope Features (Must Have)

### 1. Transcript Processing
- Accept Teams .vtt and .docx files
- Parse speaker names, timestamps, and content
- Handle both transcript formats

### 2. AI Action Item Extraction
- Use OpenAI GPT-4o to extract from transcript:
  - Title
  - Description
  - Suggested assignee (from speaker names)
  - Priority (High/Medium/Low)
  - Due date
  - Confidence score (how certain AI is)
  - Source quote (exact text from meeting)

### 3. Review UI (Angular Frontend)
- Drag-and-drop file upload
- Display extracted action items as editable cards
- Edit: title, assignee, priority, due date, description
- Add new items manually
- Remove items
- Visual confidence indicators

### 4. Jira Integration (Basic)
- Configuration form: API token + Jira domain + project key
- Bulk create tickets (all items at once)
- Default issue type: "Task"
- Map meeting speakers to Jira users
- Fallback: CSV/JSON export if Jira not configured

### 5. Deployment
- Frontend: Vercel (Angular app)
- Backend: Render (Node.js/Express/TypeScript API)
- Local development setup as fallback

---

## Out-of-Scope (Stretch Goals - If Time Permits)

### Engineering Analysis Agent
- Connect to GitHub repository
- Analyze codebase to identify:
  - Impacted modules/files
  - Affected APIs
  - Dependencies
  - Testing requirements
  - Complexity ratings
- Enrich Jira tickets with engineering context

**Why it's stretch:** This is the differentiator but requires significant additional work. Core MVP is valuable without it.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Angular |
| Backend | Node.js + Express + TypeScript |
| AI | OpenAI GPT-4o |
| Parsing | Custom VTT/DOCX parsers |
| Jira API | REST API v3 (basic auth with API token) |
| Deployment | Vercel (FE) + Render (BE) |

---
