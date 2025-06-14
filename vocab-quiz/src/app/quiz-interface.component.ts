import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
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
                #answerInput
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
                    *ngFor="let answer of getFormattedMatchedAnswers()" 
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
            
            <!-- Multi-definition unmatched answers - displayed directly in the UI -->
            <div *ngIf="currentQuestion?.type === 'definition' && isDefinitionMultiAnswerMode() && movingToNextQuestion" class="unmatched-answers-container">
              <p class="unmatched-answers-title">Definitions you haven't matched yet:</p>
              <div class="unmatched-list">
                <ul>
                  <li *ngFor="let answer of getUnmatchedAnswers()">{{ answer }}</li>
                </ul>
              </div>
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
                *ngIf="!movingToNextQuestion && !isLastQuestion"
                (click)="prepareToMoveNext()">
                <mat-icon>arrow_forward</mat-icon> Next Question
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                *ngIf="movingToNextQuestion && !isLastQuestion"
                (click)="proceedToNextQuestion()">
                <mat-icon>check</mat-icon> Continue
              </button>
              <button 
                mat-raised-button 
                color="accent" 
                *ngIf="!movingToNextQuestion && isLastQuestion"
                (click)="prepareToFinish()">
                <mat-icon>done_all</mat-icon> Finish Quiz
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                *ngIf="movingToNextQuestion && isLastQuestion"
                (click)="completeQuiz()">
                <mat-icon>check</mat-icon> Continue
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
      font-size: 1.2rem;
      height: 1.2rem;
      width: 1.2rem;
      vertical-align: middle;
    }

    .question-prompt {
      font-size: 1.5rem;
      font-weight: bold;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 8px;
      color: #3f51b5;
    }

    .answer-container {
      margin-bottom: 1.5rem;
    }

    .answer-field {
      width: 100%;
      font-size: 1.1rem;
    }

    .feedback-container {
      display: flex;
      align-items: flex-start;
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background-color: #f9f9f9;
    }

    .feedback-container.correct {
      background-color: #e8f5e9;
    }

    .feedback-container.incorrect {
      background-color: #ffebee;
    }

    .feedback-container mat-icon {
      margin-right: 1rem;
      font-size: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
    }

    .feedback-container.correct mat-icon {
      color: #4caf50;
    }

    .feedback-container.incorrect mat-icon {
      color: #f44336;
    }

    .feedback-text p {
      margin: 0.5rem 0;
    }

    .correct-answer {
      font-weight: bold;
      color: #4caf50;
    }

    .all-answers {
      margin-top: 1rem;
    }

    .all-answers-title {
      margin-bottom: 0.5rem;
      font-weight: bold;
    }

    .all-answers ul {
      margin: 0;
      padding-left: 1.5rem;
    }

    .action-buttons {
      display: flex;
      align-items: center;
      margin-top: 1.5rem;
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
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .results-score mat-icon {
      margin-right: 1rem;
      font-size: 2rem;
      height: 2rem;
      width: 2rem;
    }

    .results-summary {
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .matched-answers-container {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 8px;
      background-color: #e8f5e9;
    }

    .matched-answers-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #2e7d32;
    }

    .chip-container {
      margin-bottom: 1rem;
    }

    .completeness-bar {
      margin-top: 0.5rem;
    }

    .unmatched-answers-container {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background-color: #fff8e1;
      border: 1px solid #ffe082;
    }

    .unmatched-answers-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #ff8f00;
    }

    .unmatched-list ul {
      margin: 0;
      padding-left: 1.5rem;
    }

    .unmatched-list li {
      margin-bottom: 0.25rem;
    }
  `]
})
export class QuizInterfaceComponent implements OnInit {
  currentQuiz: Quiz | null = null;
  userAnswer: string = '';
  answerSubmitted: boolean = false;
  enterActionState: 'ready' | 'submitted' = 'ready';
  movingToNextQuestion: boolean = false;
  
  @ViewChild('answerInput') answerInput!: ElementRef<HTMLInputElement>;

  get currentQuestion(): QuizQuestion | undefined {
    if (!this.currentQuiz) return undefined;
    return this.currentQuiz.questions[this.currentQuiz.currentQuestionIndex];
  }
  
  get isLastQuestion(): boolean {
    if (!this.currentQuiz) return false;
    return this.currentQuiz.currentQuestionIndex === this.currentQuiz.questions.length - 1;
  }

  constructor(
    private router: Router,
    private quizService: QuizService,
    private vocabStorage: VocabularyStorageService,
    private pdfExportService: PdfExportService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Initialize from the current quiz in service
    this.currentQuiz = this.quizService.getCurrentQuiz();
  }

  onStartQuiz(settings: QuizSettings): void {
    this.currentQuiz = this.quizService.generateQuiz(settings);
    this.userAnswer = '';
    this.answerSubmitted = false;
    this.movingToNextQuestion = false;
  }

  onCancelQuiz(): void {
    this.currentQuiz = null;
    this.router.navigate(['/']);
  }

  submitAnswer(): void {
    if (!this.currentQuiz || !this.userAnswer.trim()) return;
    
    // In definition multi-answer mode, we don't set answerSubmitted to true
    // We just add the answer and clear the input field for the next definition
    if (this.isDefinitionMultiAnswerMode()) {
      // Split input by spaces to handle multiple words at once
      const words = this.userAnswer.trim().split(/\s+/);
      
      // Process each word individually
      for (const word of words) {
        if (word.trim()) {
          this.quizService.submitAnswer(word.trim());
        }
      }
      
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
    if (!this.currentQuiz || !this.answerSubmitted) {
      return;
    }
    
    // Standard behavior for word questions
    this.currentQuiz.currentQuestionIndex++;
    if (this.currentQuiz.currentQuestionIndex < this.currentQuiz.questions.length) {
      this.answerSubmitted = false;
      this.userAnswer = '';
      this.enterActionState = 'ready';
      this.movingToNextQuestion = false;
    }
  }
  
  /**
   * Proceeds to the next question directly (used for multi-definition mode)
   */
  proceedToNextQuestion() {
    if (!this.currentQuiz) return;
    
    this.currentQuiz.currentQuestionIndex++;
    if (this.currentQuiz.currentQuestionIndex < this.currentQuiz.questions.length) {
      this.userAnswer = '';
      this.answerSubmitted = false; 
      this.enterActionState = 'ready';
      this.movingToNextQuestion = false;
    }
  }

  completeQuiz() {
    // For definition multi-answer mode, we can complete the quiz at any time
    if (this.isDefinitionMultiAnswerMode()) {
      if (!this.currentQuiz) return;
      this.currentQuiz.isComplete = true;
      this.currentQuiz.endTime = new Date();
      
      // Calculate score
      const totalQuestions = this.currentQuiz.questions.length;
      const correctAnswers = this.currentQuiz.questions.filter(q => q.isCorrect).length;
      this.currentQuiz.score = (correctAnswers / totalQuestions) * 100;
      
      this.enterActionState = 'ready';
    } 
    // For standard mode, require answer submission first
    else if (!this.currentQuiz || !this.answerSubmitted) {
      return;
    } else {
      this.currentQuiz.isComplete = true;
      this.currentQuiz.endTime = new Date();
      
      // Calculate score
      const totalQuestions = this.currentQuiz.questions.length;
      const correctAnswers = this.currentQuiz.questions.filter(q => q.isCorrect).length;
      this.currentQuiz.score = (correctAnswers / totalQuestions) * 100;
      
      this.enterActionState = 'ready';
    }
  }

  startNewQuiz() {
    // Reset state in the component
    this.currentQuiz = null;
    this.userAnswer = '';
    this.answerSubmitted = false;
    this.movingToNextQuestion = false;
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
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Only handle Enter key and if there's a current quiz
    if (event.key !== 'Enter' || !this.currentQuiz) {
      return;
    }
    
    // Prevent default behavior for Enter key to stop form submission
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Enter pressed - State:', { 
      hasInput: !!this.userAnswer?.trim(),
      answered: this.answerSubmitted,
      isMultiMode: this.isDefinitionMultiAnswerMode(),
      moving: this.movingToNextQuestion,
      isLast: this.isLastQuestion
    });
    
    // CASE 1: User has typed something - submit the answer
    if (this.userAnswer?.trim()) {
      this.submitAnswer();
      return;
    }
    
    // CASE 2: Standard mode with answered question - move to next
    if (!this.isDefinitionMultiAnswerMode() && this.answerSubmitted) {
      if (this.isLastQuestion) {
        this.completeQuiz();
      } else {
        this.nextQuestion();
      }
      return;
    }
    
    // CASE 3: Multi-definition mode - handle two-step navigation
    if (this.isDefinitionMultiAnswerMode()) {
      // Empty input field is the signal to continue
      if (!this.userAnswer?.trim()) {
        if (!this.movingToNextQuestion) {
          // First press - show definitions
          this.prepareToMoveNext();
        } else {
          // Second press - proceed to next question/finish
          if (this.isLastQuestion) {
            this.completeQuiz();
          } else {
            this.proceedToNextQuestion();
          }
        }
      }
    }
  }

  // No longer need the Enter key up handler

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
   * Uses formatted matched answers to get a more accurate unique count
   */
  getCompletenessText(): string {
    const formattedMatched = this.getFormattedMatchedAnswers();
    const matchedCount = formattedMatched.length;
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

  /**
   * Prepare to move to the next question by showing definitions
   */
  prepareToMoveNext(): void {
    this.movingToNextQuestion = true;
  }
  
  /**
   * Prepare to finish the quiz by showing definitions
   */
  prepareToFinish(): void {
    this.movingToNextQuestion = true;
  }

  /**
   * Gets unmatched answers for the current definition question
   */
  getUnmatchedAnswers(): string[] {
    if (!this.currentQuestion?.allAnswers) return [];
    
    const formattedMatched = this.getFormattedMatchedAnswers();
    
    // Return all answers that haven't been matched yet
    return this.currentQuestion.allAnswers.filter(answer => 
      !formattedMatched.some(matched => this.isSimilarAnswer(matched, answer))
    );
  }

  /**
   * Formats matched answers for display by removing duplicates
   * and ensuring proper presentation
   */
  getFormattedMatchedAnswers(): string[] {
    if (!this.currentQuestion?.matchedAnswers) return [];
    
    // Filter out duplicate answers that might be normalized versions of each other
    const uniqueAnswers: string[] = [];
    
    for (const answer of this.currentQuestion.matchedAnswers) {
      // Skip if we already have a similar answer
      if (!uniqueAnswers.some(existing => this.isSimilarAnswer(existing, answer))) {
        uniqueAnswers.push(answer);
      }
    }
    
    return uniqueAnswers;
  }
  
  /**
   * Checks if two answers are similar (for display purposes)
   * This helps identify answers that differ only by articles or case
   */
  private isSimilarAnswer(answer1: string, answer2: string): boolean {
    if (!answer1 || !answer2) return false;
    
    // Remove leading articles and convert to lowercase for case-insensitive comparison
    const stripped1 = answer1.toLowerCase().replace(/^(a|an|the)\s+/i, '').trim();
    const stripped2 = answer2.toLowerCase().replace(/^(a|an|the)\s+/i, '').trim();
    
    // Remove punctuation and normalize spacing for a more thorough comparison
    const normalized1 = stripped1.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s+/g, ' ');
    const normalized2 = stripped2.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s+/g, ' ');
    
    return normalized1 === normalized2;
  }
}
