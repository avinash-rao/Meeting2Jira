import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { HttpEventType } from '@angular/common/http';

import { ApiService, ParsedTranscript } from '../../services/api.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
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

  constructor(
    private apiService: ApiService,
    private stateService: StateService,
    private router: Router,
    private snackBar: MatSnackBar
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
      this.snackBar.open(
        `Invalid file type. Supported: ${this.supportedExtensions.join(', ')}`,
        'Close',
        { duration: 5000 }
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
            this.snackBar.open('Transcript uploaded successfully!', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open(event.body?.error || 'Upload failed', 'Close', { duration: 5000 });
          }
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.snackBar.open('Upload failed: ' + error.message, 'Close', { duration: 5000 });
      }
    });
  }

  extractActionItems(): void {
    if (!this.transcript) return;

    this.isExtracting = true;
    this.stateService.setLoading(true);

    this.apiService.extractActionItems(this.transcript).subscribe({
      next: (response) => {
        this.isExtracting = false;
        this.stateService.setLoading(false);

        if (response.success && response.data) {
          this.stateService.setActionItems(response.data.items);
          this.snackBar.open(
            `Extracted ${response.data.totalCount} action items!`,
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/review']);
        } else {
          this.snackBar.open(response.error || 'Extraction failed', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        this.isExtracting = false;
        this.stateService.setLoading(false);
        this.snackBar.open('Extraction failed: ' + error.message, 'Close', { duration: 5000 });
      }
    });
  }

  reset(): void {
    this.selectedFile = null;
    this.transcript = null;
    this.uploadProgress = 0;
    this.stateService.reset();
  }
}

// Made with Bob