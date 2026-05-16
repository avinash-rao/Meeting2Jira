export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  confidenceScore: number;
  sourceQuote: string;
  timestamp?: string;
  jiraTicket?: {
    key: string;
    url: string;
    createdAt: string;
  };
  creationError?: string;
}

export interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export interface JiraTicket {
  id: string;
  key: string;
  self: string;
  url?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Made with Bob
