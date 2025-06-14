import { Injectable } from '@angular/core';
import { VocabularyStorageService } from './vocabulary-storage.service';
import { QuizSettings } from './quiz-settings.component';
import { VocabularyOpenAIResponse } from './ivocabulary-openai-response-interface';

export interface QuizQuestion {
  id: number;
  type: 'word' | 'definition';
  prompt: string;
  answer: string;
  allAnswers?: string[]; // All possible correct answers (for definition questions)
  matchedAnswers?: string[]; // Answers that the user has correctly matched (for definition mode)
  options?: string[]; // For multiple choice (future feature)
  userAnswer?: string;
  userAnswers?: string[]; // For tracking multiple answers in definition mode
  isCorrect?: boolean;
  completeness?: number; // Percentage of required answers provided (for definition mode)
}

export interface Quiz {
  id: string;
  title: string;
  settings: QuizSettings;
  questions: QuizQuestion[];
  startTime?: Date;
  endTime?: Date;
  currentQuestionIndex: number;
  score?: number;
  isComplete: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private currentQuiz: Quiz | null = null;

  constructor(private vocabStorage: VocabularyStorageService) {}

  /**
   * Generate a new quiz based on the provided settings
   */
  generateQuiz(settings: QuizSettings): Quiz {
    const vocab = this.vocabStorage.getVocabulary();
    if (!vocab || !vocab.vocabulary || vocab.vocabulary.length === 0) {
      throw new Error('No vocabulary available to create a quiz');
    }

    // Create questions based on the available vocabulary
    const questions = this.createQuestions(vocab, settings);

    // Create the quiz object
    const quiz: Quiz = {
      id: this.generateQuizId(),
      title: `Vocabulary Quiz (${settings.quizType})`,
      settings,
      questions,
      currentQuestionIndex: 0,
      isComplete: false
    };

    this.currentQuiz = quiz;
    return quiz;
  }

  /**
   * Get the current quiz
   */
  getCurrentQuiz(): Quiz | null {
    return this.currentQuiz;
  }

  /**
   * Submit an answer for the current question
   */
  submitAnswer(answer: string): void {
    if (!this.currentQuiz) {
      throw new Error('No active quiz');
    }

    const currentQuestion = this.currentQuiz.questions[this.currentQuiz.currentQuestionIndex];
    
    if (currentQuestion.type === 'definition' && 
        currentQuestion.allAnswers && 
        currentQuestion.allAnswers.length > 0) {
      
      // Initialize arrays if first submission
      if (!currentQuestion.userAnswers) {
        currentQuestion.userAnswers = [];
      }
      if (!currentQuestion.matchedAnswers) {
        currentQuestion.matchedAnswers = [];
      }
      
      // Store user's answer for definition mode with multiple answers
      currentQuestion.userAnswers.push(answer);
      currentQuestion.userAnswer = answer; // Keep for backward compatibility
      
      // Check this specific answer
      this.checkAnswer(currentQuestion, answer);
    } else {
      // Traditional single-answer mode
      currentQuestion.userAnswer = answer;
      currentQuestion.isCorrect = this.checkAnswer(currentQuestion, answer);
    }
  }

  /**
   * Move to the next question
   */
  nextQuestion(): boolean {
    if (!this.currentQuiz) {
      return false;
    }

    if (this.currentQuiz.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
      this.currentQuiz.currentQuestionIndex++;
      return true;
    }

    return false;
  }

  /**
   * Complete the quiz and calculate the score
   */
  completeQuiz(): Quiz {
    if (!this.currentQuiz) {
      throw new Error('No active quiz');
    }

    this.currentQuiz.isComplete = true;
    this.currentQuiz.endTime = new Date();
    
    // Calculate score
    const totalQuestions = this.currentQuiz.questions.length;
    const correctAnswers = this.currentQuiz.questions.filter(q => q.isCorrect).length;
    this.currentQuiz.score = (correctAnswers / totalQuestions) * 100;

    return this.currentQuiz;
  }

  private createQuestions(vocab: VocabularyOpenAIResponse, settings: QuizSettings): QuizQuestion[] {
    // Create a pool of potential questions
    const questionPool: QuizQuestion[] = [];
    
    vocab.vocabulary.forEach((entry, index) => {
      // Skip entries without a word or definitions
      if (!entry.word || !entry.definitions || entry.definitions.length === 0) {
        return;
      }

      // Create a question for this word (word -> definition)
      if (settings.quizType === 'definition' || settings.quizType === 'mixed') {
        questionPool.push({
          id: questionPool.length,
          type: 'definition',
          prompt: entry.word,
          answer: entry.definitions[0], // Using first definition as the primary answer
          allAnswers: [...entry.definitions] // Store all definitions as valid answers
        });
      }

      // Create a question for each definition (definition -> word)
      if (settings.quizType === 'word' || settings.quizType === 'mixed') {
        entry.definitions.forEach(definition => {
          questionPool.push({
            id: questionPool.length,
            type: 'word',
            prompt: definition,
            answer: entry.word
          });
        });
      }
    });

    // Select the required number of questions
    let selectedQuestions = questionPool;
    
    // Limit to the requested number
    if (settings.questionCount < questionPool.length) {
      selectedQuestions = this.selectRandomQuestions(questionPool, settings.questionCount);
    }

    // Randomize the order if requested
    if (settings.randomizeOrder) {
      this.shuffleArray(selectedQuestions);
    }

    return selectedQuestions;
  }

  private selectRandomQuestions(questions: QuizQuestion[], count: number): QuizQuestion[] {
    // Create a copy of the questions array
    const pool = [...questions];
    const selected: QuizQuestion[] = [];

    // Randomly select 'count' questions
    while (selected.length < count && pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(randomIndex, 1)[0]);
    }

    return selected;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Normalize text for comparison by removing case sensitivity,
   * extra whitespace, punctuation, and leading articles (a, an, the)
   */
  private normalizeText(text: string): string {
    if (!text) return '';
    
    return text
      .toLowerCase()            // Convert to lowercase
      .trim()                   // Remove leading/trailing whitespace
      .replace(/\s+/g, ' ')     // Normalize spaces (multiple spaces to single space)
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
      .replace(/\s+([,.])/g, '$1')  // Remove spaces before commas and periods
      .replace(/^(a|an|the)\s+/i, '') // Remove leading articles (a, an, the)
      .replace(/\s+(a|an|the)\s+/g, ' '); // Remove articles in the middle of the text
  }

  /**
   * Compare two strings for a match with and without articles
   * Always performs case-insensitive comparison
   */
  private textMatches(text1: string, text2: string): boolean {
    if (!text1 || !text2) return false;
    
    // First try with our standard normalization
    const normalized1 = this.normalizeText(text1);
    const normalized2 = this.normalizeText(text2);
    
    if (normalized1 === normalized2) return true;
    
    // Additional checks for case insensitivity
    // Though already handled by normalizeText, this is an extra safeguard
    if (normalized1.toLowerCase() === normalized2.toLowerCase()) return true;
    
    return false;
  }
  
  private checkAnswer(question: QuizQuestion, userAnswer: string): boolean {
    // For definition questions with multiple valid answers
    if (question.type === 'definition' && question.allAnswers && question.allAnswers.length > 0) {
      // Initialize matchedAnswers if it doesn't exist
      if (!question.matchedAnswers) {
        question.matchedAnswers = [];
      }
      
      // Check if the user's answer matches any of the valid definitions
      const matchedDefinition = question.allAnswers.find(answer => 
        this.textMatches(answer, userAnswer)
      );
      
      if (matchedDefinition) {
        // If this is a new match (not already in matchedAnswers)
        if (!question.matchedAnswers.some(matched => this.textMatches(matched, matchedDefinition))) {
          question.matchedAnswers.push(matchedDefinition);
        }
        
        // Calculate completeness percentage
        question.completeness = Math.round((question.matchedAnswers.length / question.allAnswers.length) * 100);
        
        // Mark as correct if at least one definition is matched
        question.isCorrect = question.matchedAnswers.length > 0;
        
        return true;
      }
      
      // Still mark as correct if they have at least one correct answer already
      question.isCorrect = question.matchedAnswers.length > 0;
      
      // Update completeness percentage
      question.completeness = Math.round((question.matchedAnswers.length / question.allAnswers.length) * 100);
      
      return false;
    } 
    
    // For word questions or if there are no multiple definitions
    return this.textMatches(question.answer, userAnswer);
  }

  private generateQuizId(): string {
    return `quiz_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
}