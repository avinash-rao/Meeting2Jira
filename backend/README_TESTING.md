# Quick Start - Testing Phase 2 (watsonx.ai)

This guide helps you quickly set up and run tests for Phase 2 AI Integration using IBM watsonx.ai.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **IBM watsonx.ai Credentials**:
   - API Key from IBM Cloud IAM
   - Project ID from watsonx.ai project
   - See `WATSONX_MIGRATION.md` for detailed setup

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your watsonx.ai credentials:
```env
WATSONX_API_KEY=your-watsonx-api-key-here
WATSONX_PROJECT_ID=your-project-id-here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

**How to get credentials:**
1. Create IBM Cloud account: https://cloud.ibm.com/registration
2. Create watsonx.ai instance
3. Get API key from "Manage" → "Access (IAM)" → "API keys"
4. Get Project ID from your watsonx.ai project settings

### 3. Start the Server
```bash
npm run dev
```

Server should start on http://localhost:3000

## Running Tests

### Option 1: Automated Unit Tests (Recommended)
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- watsonx.service.test.ts
npm test -- extract.controller.test.ts
npm test -- integration.test.ts

# Watch mode (re-runs on file changes)
npm test -- --watch
```

### Option 2: Manual API Testing
```bash
# Make sure server is running first
npm run dev

# In another terminal, run the test script
cd backend
./test-scripts/test-extract.sh
```

This will test:
- ✅ watsonx.ai connection
- ✅ Extraction info endpoint
- ✅ Action item extraction
- ✅ Error handling

### Option 3: Manual cURL Commands

**Test Connection:**
```bash
curl http://localhost:3000/api/extract/test
```

**Get Info:**
```bash
curl http://localhost:3000/api/extract/info
```

**Extract Action Items:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d @test-data/sample-transcript.json
```

## Expected Results

### Unit Tests
```
PASS  src/services/__tests__/watsonx.service.test.ts
PASS  src/controllers/__tests__/extract.controller.test.ts
PASS  src/__tests__/integration.test.ts

Test Suites: 3 passed, 3 total
Tests:       25+ passed, 25+ total
```

### Manual Testing
You should see action items extracted from the sample transcript:
- Test database changes (Bob Wilson, High priority)
- Update API documentation (John Doe, Medium priority)
- Review security audit (Jane Smith, High priority)
- Schedule follow-up meeting (John Doe, Low priority)

## Troubleshooting

### "WATSONX_API_KEY is not configured" or "WATSONX_PROJECT_ID is not configured"
- Check your `.env` file exists in backend/ directory
- Verify both API key and Project ID are set
- Restart the server after adding credentials

### "Cannot find module"
```bash
npm install
```

### "Port 3000 already in use"
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Tests are slow
- This is normal - watsonx.ai API calls take 5-10 seconds
- Unit tests use mocks and should be fast
- Integration tests may be slower due to model loading

### TypeScript errors
```bash
npm run build
```

## Test Coverage

Current coverage targets:
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All endpoints covered
- **Error Scenarios**: All error paths tested

View coverage report:
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## What's Being Tested

### WatsonX Service (`watsonx.service.test.ts`)
- ✅ API key and Project ID validation
- ✅ Action item extraction
- ✅ Priority normalization
- ✅ Confidence score validation
- ✅ Error handling
- ✅ Connection testing

### Extract Controller (`extract.controller.test.ts`)
- ✅ POST /api/extract endpoint
- ✅ GET /api/extract/test endpoint
- ✅ GET /api/extract/info endpoint
- ✅ Request validation
- ✅ Error responses

### Integration Tests (`integration.test.ts`)
- ✅ Complete API flow
- ✅ End-to-end scenarios
- ✅ Error handling
- ✅ Response formats

## Next Steps

After testing Phase 2:
1. ✅ Verify all tests pass
2. ✅ Check test coverage report
3. ✅ Test with your own transcripts
4. ✅ Review TESTING_GUIDE.md for detailed information
5. ✅ Proceed to Phase 3: Jira Integration

## Need Help?

- See `TESTING_GUIDE.md` for comprehensive testing documentation
- See `PHASE2_COMPLETE.md` for implementation details
- Check the test files for examples

// Made with Bob