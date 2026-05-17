# Migration from OpenAI to IBM watsonx.ai

## Overview
Phase 2 has been updated to use **IBM watsonx.ai** instead of OpenAI for AI-powered action item extraction from meeting transcripts.

## What Changed

### 1. Dependencies
**Removed:**
- `openai`: ^4.20.1

**Added:**
- `@ibm-cloud/watsonx-ai`: ^1.0.0

### 2. Environment Variables
**Old (.env):**
```env
# Old OpenAI configuration (removed)
# OPENAI_API_KEY=sk-your-openai-api-key-here
```

**New (.env):**
```env
WATSONX_API_KEY=your-watsonx-api-key-here
WATSONX_PROJECT_ID=your-project-id-here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### 3. Service Implementation
**Old:** `backend/src/services/openai.service.ts`
- Used OpenAI GPT-4o model
- Chat completions API
- JSON mode response format

**New:** `backend/src/services/watsonx.service.ts`
- Uses IBM Granite 13B Chat v2 model (`meta-llama/llama-3-3-70b-instruct`)
- Text generation API
- JSON extraction from generated text

### 4. API Responses
**Model Information:**
- Old: `model: "gpt-4o"`
- New: `model: "meta-llama/llama-3-3-70b-instruct"`, `provider: "IBM watsonx.ai"`

**Connection Messages:**
- Old: "OpenAI connection successful"
- New: "watsonx.ai connection successful"

### 5. Test Files
All test files updated to mock watsonx.ai instead of OpenAI:
- `backend/src/services/__tests__/watsonx.service.test.ts` (renamed from openai.service.test.ts)
- `backend/src/controllers/__tests__/extract.controller.test.ts`
- `backend/src/__tests__/integration.test.ts`

## Getting watsonx.ai Credentials

### 1. Create IBM Cloud Account
Visit: https://cloud.ibm.com/registration

### 2. Create watsonx.ai Instance
1. Go to IBM Cloud Catalog
2. Search for "watsonx.ai"
3. Create a new instance

### 3. Get API Key
1. Go to IBM Cloud Dashboard
2. Navigate to "Manage" → "Access (IAM)" → "API keys"
3. Create a new API key
4. Copy the key (you won't be able to see it again!)

### 4. Get Project ID
1. Open your watsonx.ai instance
2. Create or open a project
3. Go to "Manage" tab
4. Copy the Project ID

### 5. Update .env File
```bash
cd backend
cp .env.example .env
# Edit .env and add your credentials
```

## Installation

```bash
cd backend
npm install
```

This will install the `@ibm-cloud/watsonx-ai` SDK.

## Testing

### Run Unit Tests
```bash
npm test
```

### Test Connection
```bash
# Start server
npm run dev

# In another terminal
curl http://localhost:3000/api/extract/test
```

Expected response:
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

## Key Differences

### Response Format
**OpenAI (Previous):**
- Returned structured JSON directly
- Uses `response_format: { type: 'json_object' }`

**watsonx.ai:**
- Returns generated text that may include JSON
- Requires JSON extraction using regex
- More flexible but needs parsing

### Model Parameters
**OpenAI (Previous):**
```javascript
{
  model: 'gpt-4o',
  temperature: 0.3,
  response_format: { type: 'json_object' }
}
```

**watsonx.ai:**
```javascript
{
  modelId: 'meta-llama/llama-3-3-70b-instruct',
  parameters: {
    max_new_tokens: 2000,
    temperature: 0.3,
    top_p: 0.9,
    top_k: 50,
    repetition_penalty: 1.1
  }
}
```

### Error Messages
**OpenAI (Previous):**
- "OPENAI_API_KEY environment variable is required"
- "Failed to connect to OpenAI API"

**watsonx.ai:**
- "WATSONX_API_KEY environment variable is required"
- "WATSONX_PROJECT_ID environment variable is required"
- "Failed to connect to watsonx.ai"

## Troubleshooting

### "Cannot find module '@ibm-cloud/watsonx-ai'"
```bash
npm install
```

### "WATSONX_API_KEY environment variable is required"
1. Check `.env` file exists in `backend/` directory
2. Verify `WATSONX_API_KEY` is set
3. Restart the server after adding credentials

### "WATSONX_PROJECT_ID environment variable is required"
1. Get Project ID from watsonx.ai dashboard
2. Add to `.env` file
3. Restart server

### "Failed to extract JSON from watsonx.ai response"
- The model may have returned text without JSON
- Check the prompt in `watsonx.service.ts`
- Verify model is responding correctly

### Connection Test Fails
1. Verify API key is correct
2. Check Project ID is valid
3. Ensure watsonx.ai instance is active
4. Check network connectivity

## Cost Considerations

### OpenAI (Previous)
- GPT-4o: ~$0.01-0.05 per transcript
- Pay per token usage

### watsonx.ai (Current)
- Pricing varies by region and plan
- May have free tier or capacity units
- Check IBM Cloud pricing for details

## Performance

### Expected Response Times
- Connection test: < 2 seconds
- Action item extraction: 5-10 seconds (comparable to OpenAI GPT-4o)
- Depends on model load and region

### Model Capabilities
- **IBM Granite 13B Chat v2**: Good for structured extraction tasks
- Optimized for enterprise use cases
- May require prompt tuning for best results

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Get watsonx.ai credentials
3. ✅ Update `.env` file
4. ✅ Run tests: `npm test`
5. ✅ Test connection: `curl http://localhost:3000/api/extract/test`
6. ✅ Test extraction with sample data
7. ✅ Proceed to Phase 3: Jira Integration

## Support

- **watsonx.ai Documentation**: https://cloud.ibm.com/docs/watsonx-ai
- **IBM Cloud Support**: https://cloud.ibm.com/unifiedsupport
- **SDK Documentation**: https://github.com/IBM/watsonx-ai-node-sdk

// Made with Bob