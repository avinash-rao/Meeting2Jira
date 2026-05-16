# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project-Specific Rules

### Backend Development
- **File cleanup is mandatory**: Controllers MUST call `fs.unlink(file.path)` after processing uploads (see upload.controller.ts lines 52, 64)
- **Parser validation required**: VTT files must pass `VTTParser.isValid()` before parsing (upload.controller.ts line 35)
- **Dual speaker format support**: Parsers handle both `<v Speaker>text` (VTT) and `Speaker: text` (DOCX) formats
- **Static class methods**: All parsers use static methods (VTTParser.parse, DOCXParser.parse) - no instantiation needed
- **Timestamp extraction**: VTT parser extracts start timestamp from `-->` lines, DOCX supports both `HH:MM:SS` and `MM:SS` formats

### Commands
Backend (from backend/):
- `npm run dev` - Development with ts-node and nodemon hot reload
- `npm run build` - Compile TypeScript to dist/
- `npm start` - Run compiled production build from dist/
- `npm test` - Run Jest tests

Frontend (from frontend/):
- `npm start` - Angular dev server on port 4200
- `npm run build` - Production build to dist/
- `npm test` - Run Jasmine/Karma tests

### TypeScript Configuration
- **Strict mode enabled**: All strict TypeScript checks active (tsconfig.json line 8)
- **No unused code allowed**: noUnusedLocals and noUnusedParameters enforced (lines 18-19)
- **CommonJS modules**: Backend uses commonjs, not ES modules (line 4)

### File Structure Conventions
- All source files end with `// Made with Bob` comment
- Controllers use static methods, no class instantiation
- Types centralized in backend/src/types/index.ts
- Parsers in backend/src/parsers/ handle file format specifics

### Environment Variables
- `UPLOAD_DIR` defaults to `./uploads` if not set
- `MAX_FILE_SIZE` defaults to 10485760 (10MB) if not set
- `CORS_ORIGIN` defaults to `http://localhost:4200` for development

### Error Handling Pattern
- Controllers catch errors and return ApiResponse<T> format
- File cleanup happens in both success and error paths
- Parse errors wrapped with context: `Failed to parse transcript: ${error.message}`