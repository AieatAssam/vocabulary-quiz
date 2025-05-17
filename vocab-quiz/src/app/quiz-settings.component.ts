import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VocabularyStorageService } from './vocabulary-storage.service';

export interface QuizSettings {
  quizType: 'word' | 'definition' | 'mixed';
  questionCount: number;
  randomizeOrder: boolean;
  timeLimit?: number;
}

@Component({
  selector: 'app-quiz-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSliderModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <mat-card class="quiz-settings-card">
      <mat-card-header>
        <mat-card-title>Quiz Settings</mat-card-title>
        <mat-card-subtitle>Configure your vocabulary quiz</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
          <div class="form-section">
            <h3>Quiz Type</h3>
            <p class="section-description">Choose what type of questions to include in your quiz</p>
            
            <mat-radio-group formControlName="quizType" class="quiz-type-group">
              <mat-radio-button value="word" color="primary">
                <div class="radio-content">
                  <mat-icon>text_fields</mat-icon>
                  <div>
                    <span class="option-title">Word Quiz</span>
                    <span class="option-description">Provide definitions, you recall the words</span>
                  </div>
                </div>
              </mat-radio-button>
              
              <mat-radio-button value="definition" color="primary">
                <div class="radio-content">
                  <mat-icon>description</mat-icon>
                  <div>
                    <span class="option-title">Definition Quiz</span>
                    <span class="option-description">Provide words, you recall the definitions</span>
                  </div>
                </div>
              </mat-radio-button>
              
              <mat-radio-button value="mixed" color="primary">
                <div class="radio-content">
                  <mat-icon>shuffle</mat-icon>
                  <div>
                    <span class="option-title">Mixed Quiz</span>
                    <span class="option-description">A combination of both word and definition questions</span>
                  </div>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </div>
          
          <div class="form-section">
            <h3>Question Count</h3>
            <p class="section-description">How many questions would you like in your quiz?</p>
            
            <div class="question-count-container">
              <mat-form-field appearance="outline">
                <mat-label>Number of Questions</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="questionCount"
                  min="1"
                  [max]="maxQuestionCount"
                >
                <mat-error *ngIf="settingsForm.get('questionCount')?.hasError('required')">
                  Question count is required
                </mat-error>
                <mat-error *ngIf="settingsForm.get('questionCount')?.hasError('min')">
                  Minimum 1 question
                </mat-error>
                <mat-error *ngIf="settingsForm.get('questionCount')?.hasError('max')">
                  Maximum {{ maxQuestionCount }} questions
                </mat-error>
              </mat-form-field>
              
              <div class="question-count-helper">
                <span class="count-label">Available: {{ availableQuestionCount }}</span>
                <button
                  mat-button
                  type="button"
                  color="primary"
                  (click)="useMaxQuestions()"
                >
                  Use Max
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Additional Options</h3>
            <div class="options-container">
              <mat-checkbox formControlName="randomizeOrder" color="primary">
                Randomize question order
              </mat-checkbox>
              
              <mat-form-field appearance="outline" class="time-limit-field">
                <mat-label>Time Limit (minutes, optional)</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="timeLimit"
                  min="1"
                  max="60"
                >
                <mat-hint>Leave empty for no time limit</mat-hint>
              </mat-form-field>
            </div>
          </div>
        </form>
      </mat-card-content>
      
      <mat-card-actions>
        <button
          mat-button
          type="button"
          (click)="onCancel()"
        >
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="settingsForm.invalid"
          (click)="onSubmit()"
        >
          <mat-icon>play_arrow</mat-icon>
          Start Quiz
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .quiz-settings-card {
      max-width: 700px;
      margin: 2rem auto;
      padding: 0;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    mat-card-header {
      background-color: #f5f5f5;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }
    
    mat-card-title {
      margin-bottom: 0.5rem;
      color: #3f51b5;
      font-size: 1.5rem;
      font-weight: 500;
    }
    
    mat-card-content {
      padding: 1.5rem;
    }
    
    .form-section {
      margin-bottom: 2rem;
    }
    
    .form-section h3 {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    .section-description {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    
    .quiz-type-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .radio-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .option-title {
      display: block;
      font-weight: 500;
    }
    
    .option-description {
      display: block;
      font-size: 0.8rem;
      color: #666;
    }
    
    .question-count-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .question-count-helper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .count-label {
      font-size: 0.9rem;
      color: #666;
    }
    
    .options-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .time-limit-field {
      max-width: 250px;
    }
    
    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 1rem 1.5rem;
      gap: 0.5rem;
      background-color: #f5f5f5;
      border-top: 1px solid #e0e0e0;
    }
    
    @media (max-width: 600px) {
      .question-count-container {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .question-count-helper {
        flex-direction: row;
        align-items: center;
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class QuizSettingsComponent implements OnInit {
  @Output() startQuiz = new EventEmitter<QuizSettings>();
  @Output() cancel = new EventEmitter<void>();
  
  settingsForm: FormGroup;
  availableQuestionCount = 0;
  maxQuestionCount = 50;
  
  constructor(
    private fb: FormBuilder,
    private vocabStorage: VocabularyStorageService
  ) {
    this.settingsForm = this.fb.group({
      quizType: ['mixed', Validators.required],
      questionCount: [10, [Validators.required, Validators.min(1), Validators.max(this.maxQuestionCount)]],
      randomizeOrder: [true],
      timeLimit: [null]
    });
  }
  
  ngOnInit(): void {
    // Get the vocabulary and calculate available question count
    const vocab = this.vocabStorage.getVocabulary();
    if (vocab && vocab.vocabulary) {
      this.availableQuestionCount = vocab.vocabulary.length;
      
      // Update the validator based on the actual count
      const questionControl = this.settingsForm.get('questionCount');
      if (questionControl) {
        questionControl.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(Math.min(this.availableQuestionCount, this.maxQuestionCount))
        ]);
        questionControl.updateValueAndValidity();
      }
      
      // Set a reasonable default
      const defaultCount = Math.min(10, this.availableQuestionCount);
      this.settingsForm.patchValue({ questionCount: defaultCount });
    }
  }
  
  useMaxQuestions(): void {
    const maxCount = Math.min(this.availableQuestionCount, this.maxQuestionCount);
    this.settingsForm.patchValue({ questionCount: maxCount });
  }
  
  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.startQuiz.emit(this.settingsForm.value);
    }
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
} 