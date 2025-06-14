import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuizService } from './quiz.service';
import { QuizSettingsComponent, QuizSettings } from './quiz-settings.component';
import { VocabularyStorageService } from './vocabulary-storage.service';
import { Quiz, QuizQuestion } from './quiz.service';
import { PdfExportService } from './pdf-export.service';
import { NameDialogComponent, NameDialogData } from './name-dialog.component';
import { DialogComponent } from './dialog.component';

@Component({
  selector: 'app-quiz-interface',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    QuizSettingsComponent
  ],
  template: `
    <div class="quiz-container">
      <!-- Quiz Settings Screen -->
      <div *ngIf="!currentQuiz">
        <h1 class="section-title">Quiz Settings</h1>
        <p class="section-description">Configure your vocabulary quiz</p>
        <app-quiz-settings 
          (startQuiz)="onStartQuiz($event)" 
          (cancel)="onCancelQuiz()">
        </app-quiz-settings>
      </div>

      <!-- Active Quiz Screen -->
      <div *ngIf="currentQuiz && !currentQuiz.isComplete">
        <h1 class="section-title">Vocabulary Quiz</h1>
        <p class="section-description">
          {{ currentQuiz.settings.quizType | titlecase }} Quiz - 
          Question {{ currentQuiz.currentQuestionIndex + 1 }} of {{ currentQuiz.questions.length }}
        </p>

        <mat-card class="quiz-card">
          <!-- Progress Bar -->
          <div class="progress-container">
            <mat-progress-bar 
              color="primary" 
              [value]="(currentQuiz.currentQuestionIndex / currentQuiz.questions.length) * 100">
            </mat-progress-bar>
            <span class="progress-text">
              {{ currentQuiz.currentQuestionIndex + 1 }} / {{ currentQuiz.questions.length }}
            </span>
          </div>

          <!-- Current Question -->
          <div class="question-container">
            <h2 class="question-type">
              <mat-icon *ngIf="currentQuestion?.type === 'word'">description</mat-icon>
              <mat-icon *ngIf="currentQuestion?.type === 'definition'">text_fields</mat-icon>
              {{ currentQuestion?.type === 'word' ? 'What word means:' : 'Define:' }}
            </h2>
            <p class="question-prompt">{{ currentQuestion?.prompt }}</p>
          </div>

          <!-- Answer Input -->
          <div class="answer-container">
            <mat-form-field appearance="outline" class="answer-field">
              <mat-label>Your Answer</mat-label>
              <input 
                matInput 
                [(ngModel)]="userAnswer" 
                [disabled]="answerSubmitted"
                (keyup.enter)="submitAnswer()"
                placeholder="Type your answer here"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false">
            </mat-form-field>

            <!-- Definition Mode - Show matched answers as chips when defining a word -->
            <div *ngIf="currentQuestion?.type === 'definition' && isDefinitionMultiAnswerMode()" class="matched-answers-container">
              <p class="matched-answers-title">Your matched definitions ({{ getCompletenessText() }}):</p>
              <div class="chip-container">
                <mat-chip-listbox>
                  <mat-chip 
                    *ngFor="let answer of getMatchedAnswers()" 
                    color="primary" 
                    selected>
                    <mat-icon matChipAvatar>check</mat-icon>
                    {{ answer }}
                  </mat-chip>
                </mat-chip-listbox>
              </div>
              <mat-progress-bar 
                *ngIf="currentQuestion?.completeness !== undefined"
                class="completeness-bar" 
                color="accent" 
                [value]="currentQuestion?.completeness || 0">
              </mat-progress-bar>
            </div>
            
            <!-- Feedback when answer is submitted -->
            <div *ngIf="answerSubmitted && (!isDefinitionMultiAnswerMode() || !currentQuestion?.isCorrect)" class="feedback-container"
                [class.correct]="currentQuestion?.isCorrect"
                [class.incorrect]="currentQuestion?.isCorrect === false">
              <mat-icon>{{ currentQuestion?.isCorrect ? 'check_circle' : 'cancel' }}</mat-icon>
              <div class="feedback-text">
                <p>{{ currentQuestion?.isCorrect ? 'Correct!' : 'Incorrect!' }}</p>
                <!-- For word-to-definition mode (single answer) or incorrect definition questions -->
                <p *ngIf="!currentQuestion?.isCorrect && (!isDefinitionMultiAnswerMode() || currentQuestion?.type === 'word')" class="correct-answer">
                  Correct answer: {{ currentQuestion?.answer }}
                </p>
                <!-- Show multiple answers for definition questions with multiple answers - used for incorrect answers -->
                <ng-container *ngIf="!currentQuestion?.isCorrect && currentQuestion?.type === 'definition'">
                  <div *ngIf="hasMultipleAnswers() && !isDefinitionMultiAnswerMode()" class="all-answers">
                    <p class="all-answers-title">All accepted answers:</p>
                    <ul>
                      <li *ngFor="let answer of getAllAnswers()">{{ answer }}</li>
                    </ul>
                  </div>
                </ng-container>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="action-buttons">
            <button 
              mat-button 
              color="warn" 
              (click)="onCancelQuiz()">
              <mat-icon>close</mat-icon> Quit Quiz
            </button>
            <span class="spacer"></span>
            
            <!-- Definition Mode with Multiple Answers -->
            <ng-container *ngIf="isDefinitionMultiAnswerMode()">
              <button 
                mat-raised-button 
                color="primary" 
                *ngIf="hasUserAnswer()"
                (click)="submitAnswer()">
                <mat-icon>add</mat-icon> Add Definition (Enter)
              </button>
              <button 
                mat-raised-button 
                color="accent" 
                *ngIf="!isLastQuestion"
                (click)="nextQuestion()">
                <mat-icon>arrow_forward</mat-icon> Next Question
              </button>
              <button 
                mat-raised-button 
                color="accent" 
                *ngIf="isLastQuestion"
                (click)="completeQuiz()">
                <mat-icon>done_all</mat-icon> Finish Quiz
              </button>
            </ng-container>
            
            <!-- Word-to-Definition Mode (Standard) -->
            <ng-container *ngIf="!isDefinitionMultiAnswerMode()">
              <button 
                mat-raised-button 
                color="primary" 
                *ngIf="!answerSubmitted"
                (click)="submitAnswer()">
                <mat-icon>send</mat-icon> Submit (Enter)
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                *ngIf="answerSubmitted && !isLastQuestion"
                (click)="nextQuestion()">
                <mat-icon>arrow_forward</mat-icon> Next (Enter)
              </button>
              <button 
                mat-raised-button 
                color="accent" 
                *ngIf="answerSubmitted && isLastQuestion"
                (click)="completeQuiz()">
                <mat-icon>done_all</mat-icon> Finish Quiz (Enter)
              </button>
            </ng-container>
          </div>
        </mat-card>
      </div>

      <!-- Quiz Results Screen -->
      <div *ngIf="currentQuiz && currentQuiz.isComplete">
        <h1 class="section-title">Quiz Results</h1>
        <p class="section-description">Your quiz performance</p>

        <mat-card class="results-card">
          <h2 class="results-score">
            <mat-icon [color]="getScoreColor()">{{ getScoreIcon() }}</mat-icon>
            Score: {{ getScoreDisplay() }}%
          </h2>
          
          <div class="results-summary">
            <p>Correct answers: {{ getCorrectAnswerCount() }} / {{ getQuestionCount() }}</p>
            <p>Quiz type: {{ getQuizType() }}</p>
            <p *ngIf="hasQuizTimes()">
              Time taken: {{ calculateTimeTaken() }}
            </p>
          </div>

          <div class="action-buttons">
            <button 
              mat-button 
              color="primary"
              (click)="viewVocabulary()">
              <mat-icon>view_list</mat-icon> View Vocabulary
            </button>
            <button 
              mat-button 
              color="accent"
              (click)="exportResultsAsPdf()">
              <mat-icon>picture_as_pdf</mat-icon> Export Results as PDF
            </button>
            <button 
              mat-raised-button 
              color="primary"
              (click)="startNewQuiz()">
              <mat-icon>replay</mat-icon> New Quiz
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .quiz-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
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

    .quiz-card {
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .progress-container {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    mat-progress-bar {
      flex: 1;
    }

    .progress-text {
      margin-left: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .question-container {
      margin-bottom: 2rem;
      text-align: center;
    }

    .question-type {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: #555;
    }

    .question-type mat-icon {
      margin-right: 0.5rem;
      color: #3f51b5;
    }

    .question-prompt {
      font-size: 1.5rem;
      font-weight: 500;
      padding: 1rem;
      background-color: #f9f9f9;
      border-radius: 8px;
    }

    .answer-container {
      margin-bottom: 2rem;
    }

    .answer-field {
      width: 100%;
    }

    .feedback-container {
      display: flex;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .feedback-container.correct {
      background-color: rgba(76, 175, 80, 0.1);
    }

    .feedback-container.incorrect {
      background-color: rgba(244, 67, 54, 0.1);
    }

    .feedback-container mat-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
    }

    .feedback-container.correct mat-icon {
      color: #4caf50;
    }

    .feedback-container.incorrect mat-icon {
      color: #f44336;
    }

    .feedback-text p {
      margin: 0;
    }

    .correct-answer {
      font-style: italic;
      margin-top: 0.5rem !important;
      color: #555;
    }

    .all-answers {
      margin-top: 0.5rem;
    }
    
    .all-answers-title {
      font-weight: 500;
      margin-bottom: 0.25rem !important;
      color: #555;
    }
    
    .all-answers ul {
      margin: 0;
      padding-left: 1.5rem;
    }
    
    .all-answers li {
      margin-bottom: 0.25rem;
      color: #555;
    }
    
    .matched-answers-container {
      margin: 1rem 0;
      padding: 0.75rem;
      background-color: rgba(63, 81, 181, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(63, 81, 181, 0.1);
    }
    
    .matched-answers-title {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #555;
    }
    
    .chip-container {
      margin-bottom: 0.75rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .completeness-bar {
      margin-top: 0.5rem;
    }

    .action-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .spacer {
      flex: 1;
    }

    .results-card {
      padding: 2rem;
      text-align: center;
    }

    .results-score {
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .results-score mat-icon {
      font-size: 2.5rem;
      height: 2.5rem;
      width: 2.5rem;
      margin-right: 1rem;
    }

    .results-summary {
      margin-bottom: 2rem;
    }

    .results-summary p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }
  `]
})
export class QuizInterfaceComponent implements OnInit {
  currentQuiz: Quiz | null = null;
  userAnswer: string = '';
  answerSubmitted: boolean = false;
  private enterKeyState: 'up' | 'down' = 'up';
  private enterActionState: 'ready' | 'submitted' | 'next' = 'ready';

  constructor(
    private quizService: QuizService,
    private vocabStorage: VocabularyStorageService,
    private pdfExportService: PdfExportService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if there's saved vocabulary
    if (!this.vocabStorage.getVocabulary()) {
      this.router.navigate(['/']);
    }
  }

  get currentQuestion(): QuizQuestion | undefined {
    if (!this.currentQuiz) return undefined;
    return this.currentQuiz.questions[this.currentQuiz.currentQuestionIndex];
  }

  get isLastQuestion(): boolean {
    if (!this.currentQuiz) return false;
    return this.currentQuiz.currentQuestionIndex === this.currentQuiz.questions.length - 1;
  }

  onStartQuiz(settings: QuizSettings) {
    try {
      this.currentQuiz = this.quizService.generateQuiz(settings);
      this.currentQuiz.startTime = new Date();
      this.answerSubmitted = false;
      this.userAnswer = '';
    } catch (error: any) {
      console.error('Failed to start quiz:', error);
      // Handle error more gracefully - redirect to home with alert
      alert(error.message || 'Failed to create quiz. Please check your vocabulary list.');
      this.router.navigate(['/']);
    }
  }

  onCancelQuiz() {
    this.router.navigate(['/']);
  }

  submitAnswer() {
    // Don't proceed if no quiz or empty answer
    if (!this.currentQuiz || !this.userAnswer.trim()) return;
    
    // In definition multi-answer mode, we don't set answerSubmitted to true
    // We just add the answer and clear the input field for the next definition
    if (this.isDefinitionMultiAnswerMode()) {
      this.quizService.submitAnswer(this.userAnswer.trim());
      this.userAnswer = ''; // Clear for next definition input
      this.enterActionState = 'ready';
    } else {
      // Standard behavior for word questions
      this.quizService.submitAnswer(this.userAnswer.trim());
      this.answerSubmitted = true;
      this.enterActionState = 'submitted';
    }
  }

  nextQuestion() {
    // For definition multi-answer mode, we can always move to next question
    if (this.isDefinitionMultiAnswerMode()) {
      if (this.quizService.nextQuestion()) {
        this.userAnswer = '';
        this.enterActionState = 'ready';
      }
    } else if (!this.currentQuiz || !this.answerSubmitted) {
      return;
    } else {
      // Standard behavior for word questions
      if (this.quizService.nextQuestion()) {
        this.answerSubmitted = false;
        this.userAnswer = '';
        this.enterActionState = 'ready';
      }
    }
  }

  completeQuiz() {
    // For definition multi-answer mode, we can complete the quiz at any time
    if (this.isDefinitionMultiAnswerMode()) {
      if (!this.currentQuiz) return;
      this.quizService.completeQuiz();
      this.enterActionState = 'ready';
    } 
    // For standard mode, require answer submission first
    else if (!this.currentQuiz || !this.answerSubmitted) {
      return;
    } else {
      this.quizService.completeQuiz();
      this.enterActionState = 'ready';
    }
  }

  startNewQuiz() {
    // Reset state in the component
    this.currentQuiz = null;
    this.userAnswer = '';
    this.answerSubmitted = false;
  }

  viewVocabulary() {
    this.router.navigate(['/']);
  }

  getCorrectAnswerCount(): number {
    if (!this.currentQuiz || !this.currentQuiz.questions) return 0;
    return this.currentQuiz.questions.filter(q => q.isCorrect).length;
  }

  calculateTimeTaken(): string {
    if (!this.currentQuiz || !this.currentQuiz.startTime || !this.currentQuiz.endTime) return '0m 0s';

    const diffMs = this.currentQuiz.endTime.getTime() - this.currentQuiz.startTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  }

  getScoreColor(): string {
    if (!this.currentQuiz || this.currentQuiz.score === undefined) return '';

    if (this.currentQuiz.score >= 80) return 'primary';
    if (this.currentQuiz.score >= 60) return 'accent';
    return 'warn';
  }

  getScoreIcon(): string {
    if (!this.currentQuiz || this.currentQuiz.score === undefined) return '';

    if (this.currentQuiz.score >= 80) return 'emoji_events';
    if (this.currentQuiz.score >= 60) return 'thumb_up';
    return 'sentiment_neutral';
  }

  // Track Enter key down
  @HostListener('window:keydown.enter', ['$event'])
  handleEnterKeyDown(event: KeyboardEvent) {
    // Only process if the key was previously up
    if (this.enterKeyState === 'up') {
      this.enterKeyState = 'down';

      // Prevent default to avoid form submissions or button clicks
      event.preventDefault();

      // For definition multi-answer mode
      if (this.currentQuiz && this.isDefinitionMultiAnswerMode()) {
        if (this.userAnswer?.trim()) {
          // Submit the current definition
          this.submitAnswer();
          this.enterActionState = 'ready';
        } else {
          // Move to the next question if input is empty
          if (this.isLastQuestion) {
            this.completeQuiz();
          } else {
            this.nextQuestion();
          }
          this.enterActionState = 'ready';
        }
      }
      // Standard behavior for word questions
      else if (this.currentQuiz) {
        // If we're ready to submit an answer
        if (this.enterActionState === 'ready' && !this.answerSubmitted && this.userAnswer?.trim()) {
          this.submitAnswer();
          this.enterActionState = 'submitted'; // Mark that we've just submitted
        }
        // If we're ready to go to the next question
        else if (this.enterActionState === 'submitted' && this.answerSubmitted) {
          if (this.isLastQuestion) {
            this.completeQuiz();
          } else {
            this.nextQuestion();
          }
          this.enterActionState = 'ready'; // Reset to ready for the next question
        }
      }
    }
  }

  // Track Enter key up
  @HostListener('window:keyup.enter', ['$event'])
  handleEnterKeyUp(event: KeyboardEvent) {
    this.enterKeyState = 'up';
  }

  /**
   * Checks if the current question has multiple accepted answers
   */
  hasMultipleAnswers(): boolean {
    return this.currentQuestion?.allAnswers !== undefined && 
           this.currentQuestion.allAnswers.length > 1;
  }
  
  /**
   * Gets all answers for the current question or empty array if none
   */
  getAllAnswers(): string[] {
    return this.currentQuestion?.allAnswers || [];
  }
  
  /**
   * Checks if we're in definition multi-answer mode
   */
  isDefinitionMultiAnswerMode(): boolean {
    return this.currentQuestion?.type === 'definition' && 
           this.hasMultipleAnswers() && 
           this.currentQuiz?.settings.quizType !== 'word';
  }
  
  /**
   * Gets matched answers for the current definition question
   */
  getMatchedAnswers(): string[] {
    return this.currentQuestion?.matchedAnswers || [];
  }
  
  /**
   * Checks if there's text in the user answer field
   */
  hasUserAnswer(): boolean {
    return !!this.userAnswer?.trim();
  }
  
  /**
   * Gets a text representation of the completeness
   */
  getCompletenessText(): string {
    const matchedCount = this.currentQuestion?.matchedAnswers?.length || 0;
    const totalCount = this.currentQuestion?.allAnswers?.length || 0;
    
    return `${matchedCount}/${totalCount} complete`;
  }
  
  /**
   * Gets the formatted score for display
   */
  getScoreDisplay(): string {
    if (!this.currentQuiz || this.currentQuiz.score === undefined) {
      return '0';
    }
    return this.currentQuiz.score.toFixed(0);
  }
  
  /**
   * Gets the total number of questions
   */
  getQuestionCount(): number {
    return this.currentQuiz?.questions?.length || 0;
  }
  
  /**
   * Gets the quiz type formatted for display
   */
  getQuizType(): string {
    const quizType = this.currentQuiz?.settings?.quizType || 'unknown';
    return quizType.charAt(0).toUpperCase() + quizType.slice(1);
  }
  
  /**
   * Checks if quiz has valid start and end times
   */
  hasQuizTimes(): boolean {
    return !!this.currentQuiz?.startTime && !!this.currentQuiz?.endTime;
  }

  /**
   * Exports the quiz results as a PDF document
   */
  async exportResultsAsPdf(): Promise<void> {
    if (!this.currentQuiz || !this.currentQuiz.isComplete) {
      return;
    }
    
    // Open dialog to get user's name
    const dialogRef = this.dialog.open(NameDialogComponent, {
      width: '350px',
      data: { name: '' } as NameDialogData
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          // Show loading indicator
          const loadingDialog = this.dialog.open(DialogComponent, {
            width: '250px',
            disableClose: true,
            data: { message: 'Generating PDF, please wait...' }
          });
          
          // Pass the name to the PDF export service
          await this.pdfExportService.exportQuizResults(this.currentQuiz!, result);
          
          // Close loading dialog
          loadingDialog.close();
        } catch (error) {
          console.error('Failed to export PDF:', error);
          alert('Failed to generate PDF. Please try again.');
        }
      }
    });
  }
}