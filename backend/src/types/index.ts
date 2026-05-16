// Transcript Types
export interface TranscriptEntry {
  timestamp?: string;
  speaker: string;
  text: string;
}

export interface ParsedTranscript {
  speakers: string[];
  entries: TranscriptEntry[];
  metadata: {
    duration?: string;
    date?: string;
    fileName?: string;
  };
}

// Action Item Types
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  confidenceScore: number; // 0-100
  sourceQuote: string;
  timestamp?: string;
}

export interface ExtractedActionItems {
  items: ActionItem[];
  totalCount: number;
  extractedAt: string;
}

// Jira Types
export interface JiraConfig {
  domain: string;        // e.g., "yourcompany.atlassian.net"
  email: string;         // User email
  apiToken: string;      // API token
  projectKey: string;    // e.g., "PROJ"
}

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
  active: boolean;
}

export interface JiraTicket {
  id: string;
  key: string;
  self: string;
}

export interface JiraCreateResponse {
  success: boolean;
  created: JiraTicket[];
  failed: Array<{
    item: ActionItem;
    error: string;
  }>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// File Upload Types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

// Made with Bob
