import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { JiraConfig } from '../../models/action-item.model';
import { StateService } from '../../services/state.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  config: JiraConfig = {
    domain: '',
    email: '',
    apiToken: '',
    projectKey: ''
  };

  isTesting = false;
  isConfigured = false;

  constructor(
    private stateService: StateService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const savedConfig = this.stateService.getJiraConfig();
    if (savedConfig) {
      this.config = { ...savedConfig };
      this.isConfigured = true;
    }
  }

  testConnection(): void {
    if (!this.isFormValid()) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    this.isTesting = true;

    this.apiService.testJiraConnection(this.config).subscribe({
      next: (response) => {
        this.isTesting = false;
        
        if (response.success) {
          this.snackBar.open('Connection successful!', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open(
            response.data?.message || response.error || 'Connection failed',
            'Close',
            { duration: 5000 }
          );
        }
      },
      error: (error) => {
        this.isTesting = false;
        this.snackBar.open('Connection failed: ' + error.message, 'Close', { duration: 5000 });
      }
    });
  }

  saveConfiguration(): void {
    if (!this.isFormValid()) {
      this.snackBar.open('Please fill in all fields', 'Close', { duration: 3000 });
      return;
    }

    this.stateService.setJiraConfig(this.config);
    this.isConfigured = true;
    this.snackBar.open('Configuration saved successfully!', 'Close', { duration: 3000 });
  }

  clearConfiguration(): void {
    this.config = {
      domain: '',
      email: '',
      apiToken: '',
      projectKey: ''
    };
    this.stateService.setJiraConfig(null);
    this.isConfigured = false;
    this.snackBar.open('Configuration cleared', 'Close', { duration: 3000 });
  }

  isFormValid(): boolean {
    return !!(
      this.config.domain &&
      this.config.email &&
      this.config.apiToken &&
      this.config.projectKey
    );
  }
}

// Made with Bob