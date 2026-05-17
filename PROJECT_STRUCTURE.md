# Meeting2Jira - Project Structure

## Overview
Complete project structure for Meeting2Jira - a web application that converts Microsoft Teams meeting transcripts into Jira tickets using AI.

## Directory Structure

```
meeting2jira/
├── backend/                          # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/              # Request handlers
│   │   ├── services/                 # Business logic (AI, Jira)
│   │   ├── parsers/                  # Transcript parsers (VTT, DOCX)
│   │   ├── routes/                   # API route definitions
│   │   ├── types/                    # TypeScript type definitions
│   │   │   └── index.ts             # ✅ Created - All interfaces
│   │   ├── middleware/               # Express middleware
│   │   └── server.ts                # ✅ Created - Express server entry point
│   ├── uploads/                      # Temporary file storage
│   │   └── .gitkeep                 # ✅ Created
│   ├── package.json                 # ✅ Created - Dependencies
│   ├── tsconfig.json                # ✅ Created - TypeScript config
│   ├── .env.example                 # ✅ Created - Environment variables template
│   └── README.md                    # ✅ Created - Backend documentation
│
├── frontend/                         # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/          # UI components (upload, review, settings)
│   │   │   ├── services/            # API services
│   │   │   ├── models/              # TypeScript interfaces
│   │   │   │   └── action-item.model.ts  # ✅ Created - Frontend types
│   │   │   └── app.component.ts     # Root component (to be created)
│   │   ├── assets/                  # Static assets
│   │   ├── environments/
│   │   │   ├── environment.ts       # ✅ Created - Dev config
│   │   │   └── environment.prod.ts  # ✅ Created - Prod config
│   │   ├── index.html               # (to be created)
│   │   ├── main.ts                  # (to be created)
│   │   └── styles.css               # (to be created)
│   ├── angular.json                 # ✅ Created - Angular CLI config
│   ├── package.json                 # ✅ Created - Dependencies
│   ├── tsconfig.json                # ✅ Created - Base TypeScript config
│   ├── tsconfig.app.json            # ✅ Created - App TypeScript config
│   ├── tsconfig.spec.json           # ✅ Created - Test TypeScript config
│   └── README.md                    # ✅ Created - Frontend documentation
│
├── docs/                             # Documentation (to be created)
├── .gitignore                       # ✅ Updated - Comprehensive ignore rules
├── README.md                        # ✅ Exists - Project overview
├── ARCHITECTURE.md                  # ✅ Exists - Architecture documentation
├── IMPLEMENTATION_GUIDE.md          # ✅ Exists - Implementation guide
├── IMPLEMENTATION_PLAN.md           # ✅ Created - Detailed implementation plan
└── PROJECT_STRUCTURE.md             # ✅ This file
```

## Completed Setup (Phase 0.2)

### ✅ Backend Structure
- [x] Directory structure created
- [x] package.json with all dependencies
- [x] TypeScript configuration (tsconfig.json)
- [x] Environment variables template (.env.example)
- [x] Type definitions (src/types/index.ts)
- [x] Basic Express server (src/server.ts)
- [x] README documentation

### ✅ Frontend Structure
- [x] Directory structure created
- [x] package.json with Angular dependencies
- [x] Angular configuration (angular.json)
- [x] TypeScript configurations (base, app, spec)
- [x] Environment configurations (dev, prod)
- [x] Type definitions (models/action-item.model.ts)
- [x] README documentation

### ✅ Project Configuration
- [x] Comprehensive .gitignore
- [x] Upload directory with .gitkeep
- [x] Documentation files

## Next Steps

### Phase 1: Backend Foundation (Day 1 Morning)
1. Install backend dependencies: `cd backend && npm install`
2. Create .env file from .env.example
3. Implement transcript parsers (VTT, DOCX)
4. Create upload endpoint with multer

### Phase 2: AI Integration (Day 1 Afternoon)
1. Integrate IBM watsonx.ai API
2. Design extraction prompts
3. Create extraction service
4. Test with sample transcripts

### Phase 3: Jira Integration (Day 1 Afternoon)
1. Implement Jira API client
2. Create ticket creation service
3. Add user mapping logic

### Phase 4: Frontend Development (Day 2 Morning)
1. Install frontend dependencies: `cd frontend && npm install`
2. Create main Angular components
3. Implement upload UI
4. Build review interface
5. Add Jira configuration

### Phase 5: Integration & Deployment (Day 2 Afternoon)
1. Connect frontend to backend
2. End-to-end testing
3. Deploy to Vercel (frontend) and Render (backend)
4. Demo preparation

## Key Technologies

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **AI**: IBM watsonx.ai (Llama 3.3 70B Instruct)
- **File Upload**: Multer
- **Document Parsing**: Mammoth (DOCX)
- **HTTP Client**: Axios (for Jira API)

### Frontend
- **Framework**: Angular 17
- **UI Library**: Angular Material
- **Language**: TypeScript
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Version Control**: Git/GitHub

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
WATSONX_API_KEY=your-api-key
WATSONX_PROJECT_ID=your-project-id
CORS_ORIGIN=http://localhost:4200
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Frontend (environment.ts)
```typescript
{
  production: false,
  apiUrl: 'http://localhost:3000'
}
```

## API Endpoints (To Be Implemented)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | ✅ Health check |
| POST | `/api/upload` | Upload & parse transcript |
| POST | `/api/extract` | Extract action items with AI |
| POST | `/api/jira/create-tickets` | Create Jira tickets |
| GET | `/api/jira/users` | Get Jira users |
| POST | `/api/jira/test-connection` | Test Jira credentials |

## Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Run production build
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm start            # Start dev server (http://localhost:4200)
npm run build        # Build for production
```

## Project Status

**Current Phase**: ✅ Phase 0.2 - Project Structure Initialization COMPLETE

**Ready for**: Phase 1 - Backend Foundation

**Prerequisites for next phase**:
- Node.js and npm must be installed
- IBM watsonx.ai API key and project ID required
- Jira account for testing (optional for initial development)

## Notes

- TypeScript errors in backend/src/server.ts are expected until dependencies are installed
- Frontend requires Angular CLI and dependencies installation before running
- All configuration files are in place and ready for development
- Project follows best practices for TypeScript, Express, and Angular applications