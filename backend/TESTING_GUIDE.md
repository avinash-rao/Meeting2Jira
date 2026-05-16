# Testing Guide - Phase 2: AI Integration (watsonx.ai)

This guide provides comprehensive instructions for testing the Phase 2 AI integration features using IBM watsonx.ai.

## Prerequisites

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up Environment**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3000
   NODE_ENV=development
   WATSONX_API_KEY=your-watsonx-api-key-here
   WATSONX_PROJECT_ID=your-project-id-here
   WATSONX_URL=https://us-south.ml.cloud.ibm.com
   CORS_ORIGIN=http://localhost:4200
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=./uploads
   ```

   **Getting watsonx.ai Credentials:**
   - Create IBM Cloud account: https://cloud.ibm.com/registration
   - Create watsonx.ai instance
   - Get API key from IAM settings
   - Get Project ID from your watsonx.ai project
   - See `WATSONX_MIGRATION.md` for detailed instructions

3. **Start the Server**
   ```bash
   npm run dev
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- openai.service.test.ts
npm test -- extract.controller.test.ts
npm test -- integration.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

## Test Structure

### Unit Tests

#### 1. WatsonX Service Tests (`src/services/__tests__/watsonx.service.test.ts`)
Tests the core AI extraction logic using IBM watsonx.ai:
- ✅ Constructor validation (API key and Project ID required)
- ✅ Action item extraction from transcripts
- ✅ Unique ID generation
- ✅ Priority normalization (High/Medium/Low)
- ✅ Confidence score clamping (0-100)
- ✅ Empty action items handling
- ✅ Error handling (no response, API failures)
- ✅ Prompt building with timestamps
- ✅ Model and parameter configuration
- ✅ Connection testing

**Run:**
```bash
npm test -- watsonx.service.test.ts
```

#### 2. Extract Controller Tests (`src/controllers/__tests__/extract.controller.test.ts`)
Tests the API endpoint handlers:
- ✅ Successful action item extraction
- ✅ Missing transcript validation (400 error)
- ✅ Empty entries validation (400 error)
- ✅ Missing entries field validation (400 error)
- ✅ OpenAI API key error handling (500 error)
- ✅ Generic extraction error handling
- ✅ Multiple action items handling
- ✅ Connection test success/failure
- ✅ Info endpoint response

**Run:**
```bash
npm test -- extract.controller.test.ts
```

### Integration Tests

#### 3. Integration Tests (`src/__tests__/integration.test.ts`)
Tests the complete API flow:
- ✅ GET /api/extract/info - Capabilities information
- ✅ GET /api/extract/test - Connection testing
- ✅ POST /api/extract - Action item extraction
- ✅ End-to-end upload and extract flow
- ✅ Error scenarios (400, 500)

**Run:**
```bash
npm test -- integration.test.ts
```

## Manual Testing

### 1. Test OpenAI Connection

**Request:**
```bash
curl http://localhost:3000/api/extract/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "watsonx.ai connection successful",
  "data": {
    "model": "meta-llama/llama-3-3-70b-instruct",
    "status": "connected"
  }
}
```

### 2. Test Extraction Info

**Request:**
```bash
curl http://localhost:3000/api/extract/info
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "model": "meta-llama/llama-3-3-70b-instruct",
    "provider": "IBM watsonx.ai",
    "capabilities": [
      "Extract action items from meeting transcripts",
      "Identify assignees from participants",
      "Suggest priorities based on context",
      "Calculate confidence scores",
      "Include source quotes and timestamps"
    ],
    "inputFormat": "ParsedTranscript object",
    "outputFormat": "ExtractedActionItems object"
  }
}
```

### 3. Test Action Item Extraction

**Step 1: Create a test transcript file (test-transcript.json)**
```json
{
  "speakers": ["John Doe", "Jane Smith"],
  "entries": [
    {
      "timestamp": "00:00:05.000",
      "speaker": "John Doe",
      "text": "Jane, can you prepare the quarterly report by Friday?"
    },
    {
      "timestamp": "00:00:10.000",
      "speaker": "Jane Smith",
      "text": "Sure, I will have it ready by end of week."
    },
    {
      "timestamp": "00:00:20.000",
      "speaker": "John Doe",
      "text": "Also, please review the budget proposal I sent yesterday."
    }
  ],
  "metadata": {
    "duration": "00:15:30.000",
    "date": "2024-01-15T10:30:00.000Z",
    "fileName": "meeting.vtt"
  }
}
```

**Step 2: Extract action items**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d @test-transcript.json
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Prepare quarterly report",
        "description": "Prepare and finalize the quarterly report for review",
        "assignee": "Jane Smith",
        "priority": "High",
        "dueDate": "2024-01-19",
        "confidenceScore": 95,
        "sourceQuote": "Jane, can you prepare the quarterly report by Friday?",
        "timestamp": "00:00:05.000"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "Review budget proposal",
        "description": "Review the budget proposal document",
        "assignee": "Jane Smith",
        "priority": "Medium",
        "confidenceScore": 85,
        "sourceQuote": "please review the budget proposal I sent yesterday",
        "timestamp": "00:00:20.000"
      }
    ],
    "totalCount": 2,
    "extractedAt": "2024-01-15T10:35:00.000Z"
  },
  "message": "Successfully extracted 2 action item(s)"
}
```

### 4. Test Complete Upload + Extract Flow

**Step 1: Upload a VTT file**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "transcript=@sample.vtt" \
  > parsed-transcript.json
```

**Step 2: Extract action items**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d @parsed-transcript.json
```

## Error Testing

### 1. Missing API Key
Remove `OPENAI_API_KEY` from `.env` and restart server.

**Request:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"speakers":[],"entries":[{"speaker":"Test","text":"Test"}],"metadata":{}}'
```

**Expected Response (500):**
```json
{
  "success": false,
  "error": "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable."
}
```

### 2. Invalid Transcript
**Request:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Invalid transcript data. Expected ParsedTranscript object with entries array."
}
```

### 3. Empty Transcript
**Request:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"speakers":[],"entries":[],"metadata":{}}'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Transcript is empty. No entries to process."
}
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All endpoints covered
- **Error Scenarios**: All error paths tested

## Continuous Integration

Tests should be run automatically on:
- Every commit (pre-commit hook)
- Pull requests (CI/CD pipeline)
- Before deployment

## Troubleshooting

### Tests Failing with "Cannot find module"
```bash
npm install
```

### OpenAI API Errors in Tests
Tests use mocked OpenAI service. If you see real API errors, check that mocks are properly configured.

### TypeScript Errors
```bash
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Performance Testing

### Response Time Benchmarks
- Connection test: < 1 second
- Info endpoint: < 100ms
- Extraction (short transcript): 3-5 seconds
- Extraction (long transcript): 5-10 seconds

### Load Testing
```bash
# Install Apache Bench
brew install httpd  # macOS

# Test extraction endpoint
ab -n 10 -c 2 -p test-transcript.json -T application/json \
  http://localhost:3000/api/extract
```

## Next Steps

After Phase 2 testing is complete:
1. ✅ Verify all tests pass
2. ✅ Check test coverage (aim for 80%+)
3. ✅ Document any issues found
4. ✅ Proceed to Phase 3: Jira Integration

// Made with Bob