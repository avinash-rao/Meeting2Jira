import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';

import { ApiService, ParsedTranscript } from '../../services/api.service';
import { StateService } from '../../services/state.service';
import { ToastService } from '../../services/toast.service';
import { JiraConfig } from '../../models/action-item.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  isDragging = false;
  uploadProgress = 0;
  isUploading = false;
  isExtracting = false;
  selectedFile: File | null = null;
  transcript: ParsedTranscript | null = null;
  supportedExtensions: string[] = ['.vtt', '.docx'];
  isEditingConfig = false;
  editConfig: JiraConfig = {
    domain: '',
    email: '',
    apiToken: '',
    projectKey: ''
  };
  
  // Processing steps
  processingSteps = {
    parsing: false,
    analyzing: false,
    complete: false
  };
  extractedCount = 0;

  constructor(
    private apiService: ApiService,
    private stateService: StateService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Load supported file types from backend
    this.apiService.getSupportedTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.supportedExtensions = response.data.types;
        }
      },
      error: (error) => {
        console.error('Failed to load supported types', error);
      }
    });
  }

  get jiraConfig() {
    return this.stateService.getJiraConfig();
  }

  get detectedLanguage(): string {
    return this.transcript?.metadata?.language || 'Unknown';
  }
  
  get languageFlag(): string {
    const language = this.detectedLanguage.toLowerCase();
    const flags: { [key: string]: string } = {
      'english': '🇺🇸',
      'french': '🇫🇷',
      'spanish': '🇪🇸',
      'german': '🇩🇪',
      'italian': '🇮🇹',
      'portuguese': '🇵🇹',
      'russian': '🇷🇺',
      'japanese': '🇯🇵',
      'korean': '🇰🇷',
      'chinese': '🇨🇳',
      'arabic': '🇸🇦',
      'hindi': '🇮🇳'
    };
    return flags[language] || '🌐';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    // Validate file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.supportedExtensions.includes(extension)) {
      this.toastService.error(
        'Invalid File Type',
        `Supported formats: ${this.supportedExtensions.join(', ')}`
      );
      return;
    }

    this.selectedFile = file;
    this.uploadFile();
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.transcript = null;
    this.processingSteps = { parsing: false, analyzing: false, complete: false };

    this.apiService.uploadTranscript(this.selectedFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
          }
        } else if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          if (event.body?.success && event.body.data) {
            this.transcript = event.body.data;
            this.stateService.setTranscript(this.transcript);
            this.toastService.success('Upload Complete', 'Transcript uploaded successfully');
          } else {
            this.toastService.error('Upload Failed', event.body?.error || 'Unknown error');
          }
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.toastService.error('Upload Failed', error.message);
      }
    });
  }

  extractActionItems(): void {
    if (!this.transcript) return;

    this.isExtracting = true;
    this.processingSteps.parsing = true;
    this.stateService.setLoading(true);

    // Simulate parsing step
    setTimeout(() => {
      this.processingSteps.analyzing = true;
    }, 1000);

    this.apiService.extractActionItems(this.transcript).subscribe({
      next: (response) => {
        this.isExtracting = false;
        this.stateService.setLoading(false);

        if (response.success && response.data) {
          this.processingSteps.complete = true;
          this.extractedCount = response.data.totalCount;
          const items = response.data.items;
          const count = response.data.totalCount;
          
          setTimeout(() => {
            this.stateService.setActionItems(items);
            this.toastService.success(
              'Extraction Complete',
              `${count} action items found`
            );
            this.router.navigate(['/review']);
          }, 1000);
        } else {
          this.processingSteps = { parsing: false, analyzing: false, complete: false };
          this.toastService.error('Extraction Failed', response.error || 'Unknown error');
        }
      },
      error: (error) => {
        this.isExtracting = false;
        this.stateService.setLoading(false);
        this.processingSteps = { parsing: false, analyzing: false, complete: false };
        this.toastService.error('Extraction Failed', error.message);
      }
    });
  }

  reset(): void {
    this.selectedFile = null;
    this.transcript = null;
    this.uploadProgress = 0;
    this.processingSteps = { parsing: false, analyzing: false, complete: false };
    this.extractedCount = 0;
    this.stateService.reset();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  toggleEditConfig(): void {
    if (!this.isEditingConfig) {
      // Entering edit mode - copy current config
      const currentConfig = this.jiraConfig;
      if (currentConfig) {
        this.editConfig = { ...currentConfig };
      }
    }
    this.isEditingConfig = !this.isEditingConfig;
  }

  saveConfig(): void {
    if (this.isFormValid()) {
      this.stateService.setJiraConfig(this.editConfig);
      this.isEditingConfig = false;
      this.toastService.success('Configuration Updated', 'Your Jira settings have been saved');
    } else {
      this.toastService.error('Validation Error', 'Please fill in all fields');
    }
  }

  cancelEdit(): void {
    this.isEditingConfig = false;
  }

  isFormValid(): boolean {
    return !!(
      this.editConfig.domain &&
      this.editConfig.email &&
      this.editConfig.apiToken &&
      this.editConfig.projectKey
    );
  }
}

// Made with Bob