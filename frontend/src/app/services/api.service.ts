import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ActionItem, ApiResponse, JiraConfig, JiraTicket } from '../models/action-item.model';

export interface ParsedTranscript {
  speakers: string[];
  entries: TranscriptEntry[];
  metadata: {
    duration?: string;
    date?: string;
    fileName?: string;
  };
}

export interface TranscriptEntry {
  timestamp?: string;
  speaker: string;
  text: string;
}

export interface ExtractedActionItems {
  items: ActionItem[];
  totalCount: number;
  extractedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadTranscript(file: File): Observable<HttpEvent<ApiResponse<ParsedTranscript>>> {
    const formData = new FormData();
    formData.append('transcript', file);
    
    return this.http.post<ApiResponse<ParsedTranscript>>(
      `${this.apiUrl}/api/upload`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    );
  }

  extractActionItems(transcript: ParsedTranscript): Observable<ApiResponse<ExtractedActionItems>> {
    return this.http.post<ApiResponse<ExtractedActionItems>>(
      `${this.apiUrl}/api/extract`,
      transcript
    );
  }

  getSupportedTypes(): Observable<ApiResponse<{ types: string[]; maxSize: number; description: string }>> {
    return this.http.get<ApiResponse<{ types: string[]; maxSize: number; description: string }>>(
      `${this.apiUrl}/api/upload/supported-types`
    );
  }

  testJiraConnection(config: JiraConfig): Observable<ApiResponse<{ valid: boolean; message: string }>> {
    return this.http.post<ApiResponse<{ valid: boolean; message: string }>>(
      `${this.apiUrl}/api/jira/test`,
      config
    );
  }

  getJiraUsers(config: JiraConfig): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/api/jira/users`,
      config
    );
  }

  createJiraTickets(
    actionItems: ActionItem[],
    config: JiraConfig
  ): Observable<ApiResponse<{ success: boolean; created: JiraTicket[]; failed: any[] }>> {
    return this.http.post<ApiResponse<{ success: boolean; created: JiraTicket[]; failed: any[] }>>(
      `${this.apiUrl}/api/jira/create-tickets`,
      { actionItems, config }
    );
  }
}

// Made with Bob