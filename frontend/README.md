# Meeting2Jira Frontend

Angular frontend for Meeting2Jira - Convert Microsoft Teams meeting transcripts into Jira tickets.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update environment configuration in `src/environments/environment.ts` if needed

## Development

Run development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`

## Build

Build for production:
```bash
npm run build
```

Build artifacts will be in `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/      # UI components
│   │   ├── services/        # API services
│   │   ├── models/          # TypeScript interfaces
│   │   └── app.component.ts # Root component
│   ├── assets/              # Static assets
│   ├── environments/        # Environment configs
│   └── main.ts              # Entry point
├── angular.json
├── package.json
└── tsconfig.json
```

## Features

- Upload transcript files (.vtt, .docx)
- Review AI-extracted action items
- Edit action items (title, assignee, priority, due date)
- Configure Jira connection
- Create Jira tickets in bulk
- Export to CSV/JSON

## Tech Stack

- Angular 17
- Angular Material
- RxJS
- TypeScript