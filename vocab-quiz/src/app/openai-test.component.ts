import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { OpenAiService } from './openai.service';

@Component({
  selector: 'app-openai-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <h2>Test OpenAI Service</h2>
    <input type="file" accept="image/jpeg,image/png" (change)="onFileChange($event)" />
    <button mat-raised-button color="primary" (click)="extract()" [disabled]="!selectedFile || loading">Extract Vocabulary</button>
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error" style="color:#d32f2f">{{ error }}</div>
    <div *ngIf="extractedText">
      <h3>Extracted Vocabulary</h3>
      <pre>{{ extractedText }}</pre>
      <mat-form-field appearance="outline">
        <mat-label>Quiz Type</mat-label>
        <mat-select [(ngModel)]="quizType">
          <mat-option value="word">Word</mat-option>
          <mat-option value="definition">Definition</mat-option>
          <mat-option value="mixed">Mixed</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-raised-button color="accent" (click)="generateQuiz()" [disabled]="!quizType || quizLoading">Generate Quiz</button>
      <div *ngIf="quizLoading">Generating quiz...</div>
      <div *ngIf="quizText">
        <h3>Quiz</h3>
        <pre>{{ quizText }}</pre>
      </div>
    </div>
  `
})
export class OpenAiTestComponent {
  selectedFile: File | null = null;
  extractedText: string = '';
  quizType: 'word' | 'definition' | 'mixed' = 'word';
  quizText: string = '';
  loading = false;
  quizLoading = false;
  error: string = '';

  constructor(private openai: OpenAiService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async extract() {
    if (!this.selectedFile) return;
    this.loading = true;
    this.error = '';
    this.extractedText = '';
    this.quizText = '';
    try {
      this.extractedText = await this.openai.extractVocabularyFromImage(this.selectedFile);
    } catch (e: any) {
      this.error = e.message || 'Failed to extract vocabulary.';
    } finally {
      this.loading = false;
    }
  }

  async generateQuiz() {
    if (!this.extractedText) return;
    this.quizLoading = true;
    this.error = '';
    this.quizText = '';
    try {
      this.quizText = await this.openai.generateQuiz(this.extractedText, this.quizType);
    } catch (e: any) {
      this.error = e.message || 'Failed to generate quiz.';
    } finally {
      this.quizLoading = false;
    }
  }
} 