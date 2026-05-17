import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { JiraConfig } from '../../models/action-item.model';
import { StateService } from '../../services/state.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  testSuccess = false;
  testError = '';
  isFirstTime = false;

  constructor(
    private stateService: StateService,
    private apiService: ApiService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const savedConfig = this.stateService.getJiraConfig();
    if (savedConfig) {
      this.config = { ...savedConfig };
      this.isFirstTime = false;
    } else {
      this.isFirstTime = true;
    }
  }

  testConnection(): void {
    if (!this.isFormValid()) {
      this.toastService.error('Validation Error', 'Please fill in all fields');
      return;
    }

    this.isTesting = true;
    this.testSuccess = false;
    this.testError = '';

    this.apiService.testJiraConnection(this.config).subscribe({
      next: (response) => {
        this.isTesting = false;
        
        if (response.success) {
          this.testSuccess = true;
          this.toastService.success(
            'Connection Successful',
            `Connected to ${this.config.projectKey} project`
          );
        } else {
          this.testError = response.data?.message || response.error || 'Connection failed';
          this.toastService.error('Connection Failed', this.testError);
        }
      },
      error: (error) => {
        this.isTesting = false;
        this.testError = error.message || 'Connection failed';
        this.toastService.error('Connection Failed', this.testError);
      }
    });
  }

  continueToApp(): void {
    if (!this.testSuccess) {
      this.toastService.warning('Test Required', 'Please test the connection first');
      return;
    }

    this.stateService.setJiraConfig(this.config);
    this.toastService.success('Configuration Saved', 'Redirecting to app...');
    
    setTimeout(() => {
      this.router.navigate(['/upload']);
    }, 1000);
  }

  saveConfiguration(): void {
    if (!this.isFormValid()) {
      this.toastService.error('Validation Error', 'Please fill in all fields');
      return;
    }

    this.stateService.setJiraConfig(this.config);
    this.toastService.success('Configuration Saved', 'Your Jira settings have been updated');
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