# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Plan Mode Specific Rules

### Architecture Constraints
- **Static class pattern**: All parsers and controllers use static methods - this is intentional, not a mistake
- **File lifecycle management**: Uploaded files have strict cleanup requirements in both success and error paths
- **Type system centralization**: Types must be defined in backend/src/types/index.ts to avoid duplication

### Implementation State
- **Phase 1 complete**: Backend foundation with upload endpoint and transcript parsing (VTT, DOCX)
- **Phase 2 pending**: AI integration with OpenAI GPT-4o for action item extraction
- **Phase 3 pending**: Jira API integration for ticket creation
- **Phase 4 pending**: Frontend Angular components (upload, review, settings)

### Non-Standard Patterns
- **Parser validation pattern**: VTT files require `VTTParser.isValid()` check before parsing (not automatic)
- **Dual speaker format**: System must handle both `<v Speaker>text` (VTT) and `Speaker: text` (DOCX) formats
- **ApiResponse wrapper**: All API responses use consistent `ApiResponse<T>` type with success, data, error, message fields
- **File end marker**: All source files end with `// Made with Bob` comment (project convention)

### Technology Decisions
- **CommonJS not ES modules**: Backend uses CommonJS despite modern TypeScript (tsconfig.json line 4)
- **Strict TypeScript**: All strict checks enabled including noUnusedLocals and noUnusedParameters
- **No class instantiation**: Controllers and parsers designed as static utility classes, never instantiated