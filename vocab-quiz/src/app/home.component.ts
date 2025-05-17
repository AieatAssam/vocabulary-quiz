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
import { VocabularyOpenAIResponse } from './ivocabulary-openai-response-interface';
import { Router } from '@angular/router';

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
        <h1 class="section-title">Your Vocabulary List</h1>
        <p class="section-description">Review your vocabulary list extracted from the image.</p>
        <app-vocabulary-visualisation></app-vocabulary-visualisation>
        
        <!-- Start Quiz Button -->
        <div class="action-center">
          <button mat-raised-button color="primary" (click)="startQuiz()">
            <mat-icon>quiz</mat-icon> Start Quiz
          </button>
        </div>
      </ng-container>
      
      <!-- Instructions based on current state -->
      <ng-template #instructionsTemplate>
        <h1 class="section-title">Vocabulary Quiz Generator</h1>
        <p class="section-description">Create vocabulary quizzes from your study materials in three easy steps.</p>
        
        <mat-card class="instructions-card">
          <mat-icon class="instructions-icon" color="primary">
            {{ currentStepIcon }}
          </mat-icon>
          <h2>{{ currentStepTitle }}</h2>
          <p class="step-description">{{ currentStepInstructions }}</p>
          
          <!-- API Configuration Step -->
          <div *ngIf="currentStep === 'api'" class="action-container">
            <p class="instruction-hint">Your OpenAI API key is required to extract vocabulary from images.</p>
            <button mat-raised-button color="primary" (click)="openSettings()">
              <mat-icon>settings</mat-icon> Configure API Settings
            </button>
          </div>
          
          <!-- Image Upload Step -->
          <div *ngIf="currentStep === 'image'" class="upload-container">
            <p class="instruction-hint">Upload a clear image of your vocabulary sheet in a two-column format (word, definition).</p>
            <app-image-upload (imageSelected)="onImageSelected($event)"></app-image-upload>
            <div class="separator">or</div>
            <app-camera-capture (imageCaptured)="onImageSelected($event)"></app-camera-capture>
          </div>
          
          <!-- Processing Step -->
          <div *ngIf="currentStep === 'processing'" class="processing-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p class="processing-message">Processing vocabulary from image...</p>
            <p class="hint-text">This may take a few moments depending on the image size and complexity.</p>
          </div>
          
          <!-- Error display -->
          <div *ngIf="error" class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <p class="error-message">{{ error }}</p>
            <p class="error-hint" *ngIf="currentStep === 'image'">Try uploading a clearer image or check your API settings.</p>
          </div>
        </mat-card>
        
        <div class="workflow-steps">
          <div class="workflow-step" [class.active]="currentStep === 'api'">
            <div class="step-number">1</div>
            <div class="step-label">Configure API</div>
          </div>
          <div class="workflow-connector"></div>
          <div class="workflow-step" [class.active]="currentStep === 'image'">
            <div class="step-number">2</div>
            <div class="step-label">Extract Vocabulary</div>
          </div>
          <div class="workflow-connector"></div>
          <div class="workflow-step" [class.disabled]="currentStep === 'api'">
            <div class="step-number">3</div>
            <div class="step-label">Create Quiz</div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .section-title {
      text-align: center;
      margin-bottom: 0.5rem;
      color: #3f51b5;
    }
    .section-description {
      text-align: center;
      margin-bottom: 2rem;
      color: #666;
    }
    .instructions-card {
      padding: 2rem;
      text-align: center;
      margin-bottom: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .instructions-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      margin-bottom: 1rem;
    }
    .step-description {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
      color: #333;
    }
    .instruction-hint {
      margin-bottom: 1rem;
      color: #666;
      font-size: 0.95rem;
    }
    .separator {
      margin: 1rem 0;
      font-weight: bold;
      color: #666;
      position: relative;
    }
    .separator::before, .separator::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 40px;
      height: 1px;
      background: #ddd;
    }
    .separator::before {
      right: calc(50% + 10px);
    }
    .separator::after {
      left: calc(50% + 10px);
    }
    .upload-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1rem;
    }
    .action-container {
      margin-top: 1rem;
    }
    .processing-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1rem;
    }
    .processing-message {
      margin-top: 1rem;
      font-weight: 500;
    }
    .hint-text {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }
    .error-container {
      margin-top: 1.5rem;
      color: #d32f2f;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(211, 47, 47, 0.05);
      padding: 1rem;
      border-radius: 4px;
    }
    .error-message {
      margin-top: 0.5rem;
      font-weight: 500;
    }
    .error-hint {
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    .workflow-steps {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 2rem;
    }
    .workflow-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0.7;
    }
    .workflow-step.active {
      opacity: 1;
    }
    .workflow-step.disabled {
      opacity: 0.4;
    }
    .step-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .workflow-step.active .step-number {
      background: #3f51b5;
      color: white;
    }
    .workflow-connector {
      width: 40px;
      height: 2px;
      background: #e0e0e0;
      margin: 0 10px;
    }
    .action-center {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
      margin-bottom: 2rem;
    }
    .action-center button {
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
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
    private openai: OpenAiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if vocabulary is already loaded (either in memory or from localStorage)
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
      case 'image': return 'Extract Vocabulary';
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
      // Setting the image will automatically clear existing vocabulary
      this.vocabStorage.setImage(file);
      this.currentStep = 'processing';
      this.error = '';
      
      try {
        // Use OpenAI service to extract vocabulary
        const extractedResponse = await this.openai.extractVocabularyFromImage(file);
        
        if (extractedResponse && extractedResponse.vocabulary && extractedResponse.vocabulary.length > 0) {
          this.vocabStorage.setVocabulary(extractedResponse);
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

  startQuiz() {
    this.router.navigate(['/quiz']);
  }
}
