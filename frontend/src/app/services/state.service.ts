import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionItem, JiraConfig } from '../models/action-item.model';
import { ParsedTranscript } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private transcriptSubject = new BehaviorSubject<ParsedTranscript | null>(null);
  private actionItemsSubject = new BehaviorSubject<ActionItem[]>([]);
  private jiraConfigSubject = new BehaviorSubject<JiraConfig | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  transcript$: Observable<ParsedTranscript | null> = this.transcriptSubject.asObservable();
  actionItems$: Observable<ActionItem[]> = this.actionItemsSubject.asObservable();
  jiraConfig$: Observable<JiraConfig | null> = this.jiraConfigSubject.asObservable();
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {
    // Load Jira config from localStorage on init
    this.loadJiraConfig();
  }

  setTranscript(transcript: ParsedTranscript | null): void {
    this.transcriptSubject.next(transcript);
  }

  getTranscript(): ParsedTranscript | null {
    return this.transcriptSubject.value;
  }

  setActionItems(items: ActionItem[]): void {
    this.actionItemsSubject.next(items);
  }

  getActionItems(): ActionItem[] {
    return this.actionItemsSubject.value;
  }

  addActionItem(item: ActionItem): void {
    const items = [...this.actionItemsSubject.value, item];
    this.actionItemsSubject.next(items);
  }

  updateActionItem(id: string, updates: Partial<ActionItem>): void {
    const items = this.actionItemsSubject.value.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    this.actionItemsSubject.next(items);
  }

  removeActionItem(id: string): void {
    const items = this.actionItemsSubject.value.filter(item => item.id !== id);
    this.actionItemsSubject.next(items);
  }

  clearActionItems(): void {
    this.actionItemsSubject.next([]);
  }

  setJiraConfig(config: JiraConfig | null): void {
    this.jiraConfigSubject.next(config);
    if (config) {
      // Encode config using btoa for basic obfuscation
      try {
        const encoded = btoa(JSON.stringify(config));
        localStorage.setItem('jiraConfig', encoded);
      } catch (e) {
        console.error('Failed to encode Jira config', e);
      }
    } else {
      localStorage.removeItem('jiraConfig');
    }
  }

  getJiraConfig(): JiraConfig | null {
    return this.jiraConfigSubject.value;
  }

  private loadJiraConfig(): void {
    const stored = localStorage.getItem('jiraConfig');
    if (stored) {
      try {
        // Decode config using atob
        const decoded = atob(stored);
        const config = JSON.parse(decoded);
        this.jiraConfigSubject.next(config);
      } catch (e) {
        console.error('Failed to parse stored Jira config', e);
        // Clear invalid config
        localStorage.removeItem('jiraConfig');
      }
    }
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  reset(): void {
    this.transcriptSubject.next(null);
    this.actionItemsSubject.next([]);
    this.loadingSubject.next(false);
  }
}

// Made with Bob