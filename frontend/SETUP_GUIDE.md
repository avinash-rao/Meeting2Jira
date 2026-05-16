# Frontend Setup Guide

## Prerequisites
- Node.js 18+ and npm
- Backend API running (see backend/README.md)

## Installation

### 1. Install Dependencies
```bash
cd frontend
npm install
```

This will install:
- Angular 17+ framework
- Angular Material UI components
- RxJS for reactive programming
- TypeScript and build tools

### 2. Configure Environment

#### Development (default)
The development environment is already configured in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

#### Production
Update `src/environments/environment.prod.ts` with your production API URL:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com'
};
```

## Running the Application

### Development Server
```bash
npm start
```
- Opens at `http://localhost:4200`
- Hot reload enabled
- Source maps for debugging

### Production Build
```bash
npm run build
```
- Output in `dist/meeting2jira-frontend/`
- Optimized and minified
- Ready for deployment

### Run Tests
```bash
npm test
```

## Application Structure

### Routes
- `/` - Redirects to `/upload`
- `/upload` - Upload and parse transcript files
- `/review` - Review and edit action items
- `/settings` - Configure Jira connection

### Components

#### Upload Component (`/upload`)
**Features:**
- Drag-and-drop file upload
- Support for .vtt and .docx files
- Upload progress indicator
- Transcript preview with speakers and entries
- Extract action items button

**Usage:**
1. Drag a transcript file or click to browse
2. Wait for upload and parsing
3. Review transcript preview
4. Click "Extract Action Items"
5. Navigate to review page

#### Review Component (`/review`)
**Features:**
- Display action items as editable cards
- Edit title, description, assignee, priority, due date
- Confidence score badges
- Source quotes from transcript
- Add/remove items
- Bulk select/deselect
- Create Jira tickets
- Export to CSV/JSON

**Usage:**
1. Review extracted action items
2. Edit any fields as needed
3. Add new items or remove unwanted ones
4. Select items to create (or create all)
5. Click "Create Jira Tickets"

#### Settings Component (`/settings`)
**Features:**
- Jira configuration form
- Test connection button
- Save/clear configuration
- API token generation instructions
- Security notice

**Usage:**
1. Enter Jira domain (e.g., yourcompany.atlassian.net)
2. Enter your Jira email
3. Generate and enter API token
4. Enter project key (e.g., PROJ)
5. Test connection
6. Save configuration

### Services

#### ApiService
Handles all HTTP communication with backend:
- `uploadTranscript(file)` - Upload and parse transcript
- `extractActionItems(transcript)` - Extract action items with AI
- `getSupportedTypes()` - Get supported file types
- `testJiraConnection(config)` - Test Jira credentials
- `getJiraUsers(config)` - Fetch Jira users
- `createJiraTickets(items, config)` - Create Jira tickets

#### StateService
Manages application state:
- Transcript state
- Action items state (CRUD operations)
- Jira configuration (persisted in localStorage)
- Loading state

## Material Design Components

The application uses Angular Material for UI:
- **Navigation**: Toolbar with routing
- **Forms**: Form fields, inputs, selects, date pickers
- **Feedback**: Snackbars, progress bars, spinners
- **Layout**: Cards, chips, buttons, icons
- **Interaction**: Checkboxes, dialogs

## Data Flow

### Upload Flow
```
User uploads file
  → ApiService.uploadTranscript()
  → Backend parses file
  → StateService.setTranscript()
  → Display preview
  → User clicks "Extract"
  → ApiService.extractActionItems()
  → Backend calls AI
  → StateService.setActionItems()
  → Navigate to /review
```

### Review Flow
```
Display action items from StateService
  → User edits items
  → StateService.updateActionItem()
  → User clicks "Create Tickets"
  → Check Jira config
  → ApiService.createJiraTickets()
  → Backend creates tickets
  → Display success/errors
```

### Settings Flow
```
Load config from StateService (localStorage)
  → User enters credentials
  → User clicks "Test Connection"
  → ApiService.testJiraConnection()
  → Display result
  → User clicks "Save"
  → StateService.setJiraConfig()
  → Persist to localStorage
```

## Styling

### Global Styles
- Material Design theme: Indigo-Pink
- Custom utility classes in `styles.css`
- Responsive breakpoints for mobile/tablet/desktop

### Component Styles
Each component has its own CSS file with:
- Component-specific styles
- Responsive design
- Material Design integration

## Error Handling

### User Feedback
- **Snackbar notifications** for all operations
- **Loading indicators** during async operations
- **Form validation** with error messages
- **Empty states** with helpful guidance

### Error Types
- Upload errors (file type, size, network)
- Extraction errors (AI service, parsing)
- Jira errors (authentication, API)
- Network errors (timeout, connection)

## Local Storage

### Stored Data
- **Jira Configuration**: Domain, email, API token, project key
- **Security**: Data only sent to Jira API, never to our backend

### Clear Storage
```javascript
localStorage.removeItem('jiraConfig');
```
Or use the "Clear" button in Settings.

## Development Tips

### Hot Reload
Changes to TypeScript, HTML, or CSS files trigger automatic reload.

### Debugging
- Open browser DevTools
- Check Console for errors
- Use Angular DevTools extension
- Inspect Network tab for API calls

### Common Issues

**TypeScript Errors**
- Run `npm install` to install dependencies
- Check `tsconfig.json` for strict mode settings

**API Connection**
- Ensure backend is running on port 3000
- Check CORS configuration in backend
- Verify environment.ts has correct API URL

**Material Components**
- Ensure all Material modules are imported
- Check Angular Material version compatibility

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Manual Deployment
```bash
# Build
npm run build

# Deploy dist/meeting2jira-frontend/ to your hosting
```

### Environment Variables
Set production API URL in Vercel:
- `VITE_API_URL` or update `environment.prod.ts`

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance
- Lazy loading for routes
- OnPush change detection (where applicable)
- Optimized production builds
- Material Design tree-shaking

## Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast support

## Next Steps
1. Install dependencies: `npm install`
2. Start dev server: `npm start`
3. Configure Jira in Settings
4. Upload a transcript
5. Extract and review action items
6. Create Jira tickets

## Support
- Check `PHASE4_COMPLETE.md` for implementation details
- Review component source code for examples
- Check backend API documentation

<!-- Made with Bob -->