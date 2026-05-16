# Meeting2Jira Backend

Backend API for Meeting2Jira - Convert Microsoft Teams meeting transcripts into Jira tickets.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

## Build

Build for production:
```bash
npm run build
```

## Run Production

```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Check if API is running

### Upload & Parse
- `POST /api/upload` - Upload and parse transcript (.vtt or .docx)

### AI Extraction
- `POST /api/extract` - Extract action items from transcript

### Jira Integration
- `POST /api/jira/create-tickets` - Create Jira tickets
- `GET /api/jira/users` - Get Jira users for mapping
- `POST /api/jira/test-connection` - Test Jira credentials

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── parsers/         # Transcript parsers
│   ├── routes/          # API routes
│   ├── types/           # TypeScript types
│   ├── middleware/      # Express middleware
│   └── server.ts        # Entry point
├── uploads/             # Temporary file storage
├── package.json
└── tsconfig.json