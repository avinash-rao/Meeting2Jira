import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ActionItem } from '../../models/action-item.model';
import { StateService } from '../../services/state.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  actionItems: ActionItem[] = [];
  selectedItems: Set<string> = new Set();
  isCreatingTickets = false;
  priorities = ['High', 'Medium', 'Low'];
  transcript: any = null;

  constructor(
    private stateService: StateService,
    private apiService: ApiService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.stateService.actionItems$.subscribe(items => {
      this.actionItems = items;
    });
    
    this.transcript = this.stateService.getTranscript();
  }

  get meetingFileName(): string {
    return this.transcript?.metadata?.fileName || 'Meeting Transcript';
  }

  toggleSelection(id: string): void {
    const item = this.actionItems.find(i => i.id === id);
    if (item?.jiraTicket) return;
    
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
  }

  toggleSelectAll(): void {
    const selectableItems = this.actionItems.filter(item => !item.jiraTicket);
    if (this.selectedItems.size === selectableItems.length) {
      this.selectedItems.clear();
    } else {
      selectableItems.forEach(item => this.selectedItems.add(item.id));
    }
  }

  isSelected(id: string): boolean {
    return this.selectedItems.has(id);
  }

  allSelected(): boolean {
    const selectableItems = this.actionItems.filter(item => !item.jiraTicket);
    return selectableItems.length > 0 && this.selectedItems.size === selectableItems.length;
  }

  getConfidenceClass(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 70) return 'good';
    return 'low';
  }

  getConfidenceLabel(score: number): string {
    if (score >= 80) return 'High confidence';
    if (score >= 70) return 'Good confidence';
    return '⚠ Low confidence';
  }

  updateItem(id: string, field: keyof ActionItem, value: any): void {
    this.stateService.updateActionItem(id, { [field]: value });
  }

  removeItem(id: string): void {
    this.stateService.removeActionItem(id);
    this.selectedItems.delete(id);
    this.toastService.success('Item Removed', 'Action item has been deleted');
  }

  createJiraTickets(): void {
    const config = this.stateService.getJiraConfig();
    
    if (!config) {
      this.toastService.error('Configuration Required', 'Please configure Jira settings first');
      this.router.navigate(['/setup']);
      return;
    }

    const itemsToCreate = this.selectedItems.size > 0
      ? this.actionItems.filter(item => this.selectedItems.has(item.id) && !item.jiraTicket)
      : this.actionItems.filter(item => !item.jiraTicket);

    if (itemsToCreate.length === 0) {
      this.toastService.warning('No Items Selected', 'Please select items to create');
      return;
    }

    this.isCreatingTickets = true;

    this.apiService.createJiraTickets(itemsToCreate, config).subscribe({
      next: (response) => {
        this.isCreatingTickets = false;
        
        if (response.success && response.data) {
          const { created, failed } = response.data;
          
          created.forEach((ticket, index) => {
            const item = itemsToCreate[index];
            if (item) {
              this.stateService.updateActionItem(item.id, {
                jiraTicket: {
                  key: ticket.key,
                  url: ticket.url || `https://${config.domain}/browse/${ticket.key}`,
                  createdAt: new Date().toISOString()
                }
              });
              
              // Show individual success toast with link
              this.toastService.success(
                `${ticket.key} created successfully`,
                'Ticket has been created in Jira',
                {
                  text: 'View in Jira →',
                  url: ticket.url || `https://${config.domain}/browse/${ticket.key}`
                }
              );
            }
          });

          failed.forEach((failure: any) => {
            const item = this.actionItems.find(i => i.id === failure.item?.id);
            if (item) {
              this.stateService.updateActionItem(item.id, {
                creationError: failure.error
              });
            }
          });

          created.forEach(ticket => {
            const item = this.actionItems.find(i => i.jiraTicket?.key === ticket.key);
            if (item) {
              this.selectedItems.delete(item.id);
            }
          });
          
          if (failed.length > 0) {
            this.toastService.error(
              'Some Tickets Failed',
              `${failed.length} ticket(s) could not be created`
            );
          }
        } else {
          this.toastService.error('Creation Failed', response.error || 'Unknown error');
        }
      },
      error: (error) => {
        this.isCreatingTickets = false;
        this.toastService.error('Creation Failed', error.message);
      }
    });
  }

  exportToCSV(): void {
    const headers = ['Title', 'Description', 'Assignee', 'Priority', 'Due Date', 'Confidence', 'Source'];
    const rows = this.actionItems.map(item => [
      item.title,
      item.description,
      item.assignee,
      item.priority,
      item.dueDate || '',
      item.confidenceScore.toString(),
      item.sourceQuote
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-items-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.success('Export Complete', 'CSV file has been downloaded');
  }

  exportToJSON(): void {
    const json = JSON.stringify(this.actionItems, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-items-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.success('Export Complete', 'JSON file has been downloaded');
  }
}

// Made with Bob