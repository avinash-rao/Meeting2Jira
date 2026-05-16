import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { ActionItem } from '../../models/action-item.model';
import { StateService } from '../../services/state.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  actionItems: ActionItem[] = [];
  selectedItems: Set<string> = new Set();
  isCreatingTickets = false;
  priorities = ['High', 'Medium', 'Low'];

  constructor(
    private stateService: StateService,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.stateService.actionItems$.subscribe(items => {
      this.actionItems = items;
      if (items.length === 0) {
        this.snackBar.open('No action items found. Please upload a transcript first.', 'Close', {
          duration: 5000
        });
      }
    });
  }

  toggleSelection(id: string): void {
    if (this.selectedItems.has(id)) {
      this.selectedItems.delete(id);
    } else {
      this.selectedItems.add(id);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedItems.size === this.actionItems.length) {
      this.selectedItems.clear();
    } else {
      this.actionItems.forEach(item => this.selectedItems.add(item.id));
    }
  }

  isSelected(id: string): boolean {
    return this.selectedItems.has(id);
  }

  allSelected(): boolean {
    return this.actionItems.length > 0 && this.selectedItems.size === this.actionItems.length;
  }

  someSelected(): boolean {
    return this.selectedItems.size > 0 && this.selectedItems.size < this.actionItems.length;
  }

  updateItem(id: string, field: keyof ActionItem, value: any): void {
    this.stateService.updateActionItem(id, { [field]: value });
  }

  removeItem(id: string): void {
    this.stateService.removeActionItem(id);
    this.selectedItems.delete(id);
    this.snackBar.open('Action item removed', 'Close', { duration: 2000 });
  }

  addNewItem(): void {
    const newItem: ActionItem = {
      id: `manual-${Date.now()}`,
      title: 'New Action Item',
      description: '',
      assignee: '',
      priority: 'Medium',
      confidenceScore: 100,
      sourceQuote: 'Manually added',
      dueDate: undefined
    };
    this.stateService.addActionItem(newItem);
    this.snackBar.open('New action item added', 'Close', { duration: 2000 });
  }

  getConfidenceColor(score: number): string {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  }

  getConfidenceLabel(score: number): string {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  }

  createJiraTickets(): void {
    const config = this.stateService.getJiraConfig();
    
    if (!config) {
      this.snackBar.open('Please configure Jira settings first', 'Go to Settings', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.router.navigate(['/settings']);
      });
      return;
    }

    const itemsToCreate = this.selectedItems.size > 0
      ? this.actionItems.filter(item => this.selectedItems.has(item.id))
      : this.actionItems;

    if (itemsToCreate.length === 0) {
      this.snackBar.open('No items selected', 'Close', { duration: 3000 });
      return;
    }

    this.isCreatingTickets = true;

    this.apiService.createJiraTickets(itemsToCreate, config).subscribe({
      next: (response) => {
        this.isCreatingTickets = false;
        
        if (response.success && response.data) {
          const { created, failed } = response.data;
          
          if (created.length > 0) {
            this.snackBar.open(
              `Successfully created ${created.length} Jira ticket(s)!`,
              'Close',
              { duration: 5000 }
            );
          }
          
          if (failed.length > 0) {
            this.snackBar.open(
              `${failed.length} ticket(s) failed to create`,
              'Close',
              { duration: 5000 }
            );
          }
        } else {
          this.snackBar.open(response.error || 'Failed to create tickets', 'Close', {
            duration: 5000
          });
        }
      },
      error: (error) => {
        this.isCreatingTickets = false;
        this.snackBar.open('Failed to create tickets: ' + error.message, 'Close', {
          duration: 5000
        });
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

    this.snackBar.open('CSV exported successfully', 'Close', { duration: 3000 });
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

    this.snackBar.open('JSON exported successfully', 'Close', { duration: 3000 });
  }
}

// Made with Bob