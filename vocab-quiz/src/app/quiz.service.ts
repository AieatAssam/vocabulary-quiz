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
  options?: string[]; // For multiple choice (future feature)
  userAnswer?: string;
  isCorrect?: boolean;
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
    currentQuestion.userAnswer = answer;
    
    // Check if the answer is correct (implement a more sophisticated matching later)
    currentQuestion.isCorrect = this.checkAnswer(currentQuestion, answer);
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

  private checkAnswer(question: QuizQuestion, userAnswer: string): boolean {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    
    // For definition questions with multiple valid answers
    if (question.type === 'definition' && question.allAnswers && question.allAnswers.length > 0) {
      // Check if the user's answer matches any of the valid definitions
      return question.allAnswers.some(answer => 
        answer.trim().toLowerCase() === normalizedUserAnswer
      );
    } 
    
    // For word questions or if there are no multiple definitions
    const normalizedCorrectAnswer = question.answer.trim().toLowerCase();
    return normalizedUserAnswer === normalizedCorrectAnswer;
  }

  private generateQuizId(): string {
    return `quiz_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
} 