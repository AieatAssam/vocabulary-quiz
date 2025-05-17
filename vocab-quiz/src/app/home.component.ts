import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VocabularyStorageService } from './vocabulary-storage.service';
import { ConfigurationService } from './configuration.service';
import { ImageUploadComponent } from './image-upload.component';
import { CameraCaptureComponent } from './camera-capture.component';
import { VocabularyVisualisationComponent } from './vocabulary-visualisation.component';
import { OpenAiService } from './openai.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ImageUploadComponent,
    CameraCaptureComponent,
    VocabularyVisualisationComponent
  ],
  template: `
    <div class="home-container">
      <!-- Show vocabulary visualisation when vocabulary is loaded -->
      <ng-container *ngIf="hasVocabulary; else instructionsTemplate">
        <app-vocabulary-visualisation></app-vocabulary-visualisation>
      </ng-container>
      
      <!-- Instructions based on current state -->
      <ng-template #instructionsTemplate>
        <mat-card class="instructions-card">
          <mat-icon class="instructions-icon" color="primary">
            {{ currentStepIcon }}
          </mat-icon>
          <h2>{{ currentStepTitle }}</h2>
          <p>{{ currentStepInstructions }}</p>
          
          <!-- API Configuration Step -->
          <div *ngIf="currentStep === 'api'" class="action-container">
            <button mat-raised-button color="primary" (click)="openSettings()">
              Configure API Settings
            </button>
          </div>
          
          <!-- Image Upload Step -->
          <div *ngIf="currentStep === 'image'" class="upload-container">
            <app-image-upload (imageSelected)="onImageSelected($event)"></app-image-upload>
            <div class="separator">or</div>
            <app-camera-capture (imageCaptured)="onImageSelected($event)"></app-camera-capture>
          </div>
          
          <!-- Processing Step -->
          <div *ngIf="currentStep === 'processing'" class="processing-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Processing vocabulary from image...</p>
          </div>
          
          <!-- Error display -->
          <div *ngIf="error" class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <p class="error-message">{{ error }}</p>
          </div>
        </mat-card>
      </ng-template>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .instructions-card {
      padding: 2rem;
      text-align: center;
      margin-bottom: 2rem;
    }
    .instructions-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      margin-bottom: 1.5rem;
    }
    .separator {
      margin: 1rem 0;
      font-weight: bold;
      color: #666;
    }
    .upload-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1.5rem;
    }
    .action-container {
      margin-top: 1.5rem;
    }
    .processing-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1.5rem;
    }
    .error-container {
      margin-top: 1.5rem;
      color: #d32f2f;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .error-message {
      margin-top: 0.5rem;
    }
  `]
})
export class HomeComponent implements OnInit {
  hasVocabulary = false;
  currentStep: 'api' | 'image' | 'processing' = 'api';
  error = '';
  
  constructor(
    private vocabStorage: VocabularyStorageService,
    private config: ConfigurationService,
    private openai: OpenAiService
  ) {}

  ngOnInit() {
    // Check if vocabulary is already loaded
    this.hasVocabulary = !!this.vocabStorage.getVocabulary();
    
    // Determine current step based on state
    if (!this.hasVocabulary) {
      if (!this.config.getApiKey()) {
        this.currentStep = 'api';
      } else {
        this.currentStep = 'image';
      }
    }
    
    // Subscribe to vocabulary changes
    this.vocabStorage.vocab$.subscribe(vocab => {
      this.hasVocabulary = !!vocab;
    });
  }
  
  get currentStepIcon(): string {
    switch (this.currentStep) {
      case 'api': return 'key';
      case 'image': return 'upload';
      case 'processing': return 'sync';
      default: return 'help';
    }
  }
  
  get currentStepTitle(): string {
    switch (this.currentStep) {
      case 'api': return 'Configure API Settings';
      case 'image': return 'Upload Vocabulary Image';
      case 'processing': return 'Processing Image';
      default: return 'Next Step';
    }
  }
  
  get currentStepInstructions(): string {
    switch (this.currentStep) {
      case 'api': 
        return 'To get started, configure your OpenAI API key and model settings.';
      case 'image': 
        return 'Upload an image of your vocabulary sheet or take a photo using your camera.';
      case 'processing': 
        return 'Please wait while we extract vocabulary from your image.';
      default: 
        return 'Follow the next steps to create your vocabulary quiz.';
    }
  }
  
  openSettings() {
    // This would normally open a dialog, but for this implementation
    // we'll just move to the next step
    this.currentStep = 'image';
  }
  
  async onImageSelected(file: File) {
    if (file) {
      this.vocabStorage.setImage(file);
      this.currentStep = 'processing';
      this.error = '';
      
      try {
        // Use OpenAI service to extract vocabulary
        const extractedText = await this.openai.extractVocabularyFromImage(file);
        
        if (extractedText) {
          this.vocabStorage.setVocabulary(extractedText);
          // No need to manually update wizard state as header now listens to vocabulary changes
        } else {
          this.error = 'No vocabulary was extracted from the image.';
          this.currentStep = 'image';
        }
      } catch (e: any) {
        this.error = e.message || 'Failed to extract vocabulary from image.';
        this.currentStep = 'image';
        console.error('Error extracting vocabulary:', e);
      }
    }
  }
}
