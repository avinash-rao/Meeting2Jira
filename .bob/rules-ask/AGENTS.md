# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Ask Mode Specific Rules

### Project Structure Context
- **Backend in backend/**: Node.js + Express + TypeScript API server
- **Frontend in frontend/**: Angular 17 application (not yet fully implemented)
- **Parsers handle dual formats**: VTT uses `<v Speaker>text`, DOCX uses `Speaker: text`

### Documentation References
- **IMPLEMENTATION_PLAN.md**: Source of truth for current implementation state and next steps
- **PROJECT_STRUCTURE.md**: Complete directory structure and technology stack
- **Phase 1 complete**: Backend foundation with upload and parsing functionality implemented

### Non-Obvious Architecture
- **Static parser classes**: VTTParser and DOCXParser use static methods, never instantiated
- **Static controllers**: UploadController methods are static, no class instances created
- **File cleanup pattern**: Uploaded files MUST be deleted after processing in both success and error paths
- **Type centralization**: All shared types defined in backend/src/types/index.ts, not inline

### Environment Configuration
- Backend runs on port 3000 by default
- Frontend configured for port 4200
- CORS configured for localhost:4200 in development
- Upload directory defaults to ./uploads with 10MB file size limit