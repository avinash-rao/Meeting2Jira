# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Code Mode Specific Rules

### File Management
- **Mandatory cleanup**: MUST call `fs.unlink(file.path)` after processing uploads in both success and error paths
- **Error path cleanup**: Always wrap file operations in try-catch and clean up in catch block (upload.controller.ts lines 62-67)

### Parser Implementation
- **Static methods only**: Parsers (VTTParser, DOCXParser) use static methods - never instantiate parser classes
- **Validation before parsing**: VTT files MUST pass `VTTParser.isValid()` check before calling `VTTParser.parse()`
- **Dual format support**: VTT uses `<v Speaker>text`, DOCX uses `Speaker: text` - both must be handled

### Controller Patterns
- **Static methods**: All controller methods are static (UploadController.uploadTranscript, UploadController.getSupportedTypes)
- **ApiResponse wrapper**: All responses use `ApiResponse<T>` type with success, data, error, message fields
- **No class instantiation**: Controllers are never instantiated, only static methods called

### TypeScript Strictness
- **No unused variables**: noUnusedLocals and noUnusedParameters are enforced - remove all unused code
- **Strict null checks**: All strict mode checks enabled - handle undefined/null explicitly
- **CommonJS imports**: Use `import` syntax but compiles to CommonJS (not ES modules)

### File Conventions
- **End marker**: All source files MUST end with `// Made with Bob` comment
- **Type centralization**: All shared types in backend/src/types/index.ts, never define types inline in controllers