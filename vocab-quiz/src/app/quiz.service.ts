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
  wordId?: string; // The word this question is testing (for better distribution)
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
      startTime: new Date(),
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
      
      // Check this specific answer and update matched answers
      const wasCorrect = this.checkAnswer(currentQuestion, answer);
      
      // The question is considered correct if at least one definition has been matched
      currentQuestion.isCorrect = currentQuestion.matchedAnswers && currentQuestion.matchedAnswers.length > 0;
      
      return;
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
          allAnswers: [...entry.definitions], // Store all definitions as valid answers
          wordId: entry.word // Track which word this question is for
        });
      }

      // Create a question for each definition (definition -> word)
      if (settings.quizType === 'word' || settings.quizType === 'mixed') {
        entry.definitions.forEach(definition => {
          questionPool.push({
            id: questionPool.length,
            type: 'word',
            prompt: definition,
            answer: entry.word,
            wordId: entry.word // Track which word this question is for
          });
        });
      }
    });

    // Select the required number of questions with better distribution
    let selectedQuestions: QuizQuestion[] = [];
    
    // If we need to limit the number of questions
    if (settings.questionCount < questionPool.length) {
      if (settings.quizType === 'mixed') {
        // For mixed quizzes, ensure an even distribution of both question types
        const wordQuestions = questionPool.filter(q => q.type === 'word');
        const defQuestions = questionPool.filter(q => q.type === 'definition');
        
        // Determine how many of each type to include
        const wordCount = Math.floor(settings.questionCount / 2);
        const defCount = settings.questionCount - wordCount;
        
        // Select distributed questions of each type
        const selectedWordQuestions = this.selectDistributedQuestions(wordQuestions, wordCount);
        const selectedDefQuestions = this.selectDistributedQuestions(defQuestions, defCount);
        
        // Combine both types
        selectedQuestions = [...selectedWordQuestions, ...selectedDefQuestions];
      }
      else if (settings.quizType === 'word' || settings.quizType === 'definition') {
        selectedQuestions = this.selectDistributedQuestions(questionPool, settings.questionCount);
      } else {
        // Fallback to random selection for any other quiz types
        selectedQuestions = this.selectRandomQuestions(questionPool, settings.questionCount);
      }
    } else {
      selectedQuestions = [...questionPool];
    }

    // Randomize the order if requested
    if (settings.randomizeOrder) {
      this.shuffleArray(selectedQuestions);
    }

    return selectedQuestions;
  }

  /**
   * Select questions ensuring a better distribution of unique words
   * This prevents the same word from appearing too many times while others don't appear at all
   */
  private selectDistributedQuestions(questions: QuizQuestion[], count: number): QuizQuestion[] {
    // Group questions by wordId (the word being tested)
    const questionsByWord: { [wordId: string]: QuizQuestion[] } = {};
    questions.forEach(q => {
      const wordId = q.wordId || q.answer; // Use answer as fallback if wordId is undefined
      if (!questionsByWord[wordId]) {
        questionsByWord[wordId] = [];
      }
      questionsByWord[wordId].push(q);
    });

    const wordIds = Object.keys(questionsByWord);
    const selectedQuestions: QuizQuestion[] = [];
    
    // First, ensure each word is represented at least once (if there's room)
    const wordsToInclude = Math.min(wordIds.length, count);
    
    // Shuffle the words to randomize which ones are selected
    this.shuffleArray(wordIds);
    
    // Pick one question from each word first
    for (let i = 0; i < wordsToInclude; i++) {
      const wordId = wordIds[i];
      const wordQuestions = questionsByWord[wordId];
      
      // Randomly select one question for this word
      const randomIndex = Math.floor(Math.random() * wordQuestions.length);
      selectedQuestions.push(wordQuestions.splice(randomIndex, 1)[0]);
    }
    
    // If we still need more questions, go through words again in rotation
    if (selectedQuestions.length < count) {
      // Create a pool of all remaining questions
      const remainingQuestions: QuizQuestion[] = [];
      wordIds.forEach(wordId => {
        remainingQuestions.push(...questionsByWord[wordId]);
      });
      
      // Shuffle the remaining questions
      this.shuffleArray(remainingQuestions);
      
      // Add remaining questions up to the count
      while (selectedQuestions.length < count && remainingQuestions.length > 0) {
        selectedQuestions.push(remainingQuestions.pop()!);
      }
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
    
    // Apply normalization to both texts
    const normalized1 = this.normalizeText(text1);
    const normalized2 = this.normalizeText(text2);
    
    // Skip comparison if either string is too short after normalization
    if (normalized1.length < 2 || normalized2.length < 2) return false;
    
    console.log(`Comparing "${text1}" with "${text2}" (normalized: "${normalized1}" vs "${normalized2}")`);
    
    // Check if normalized texts match exactly
    return normalized1 === normalized2;
  }
  
  private checkAnswer(question: QuizQuestion, userAnswer: string): boolean {
    // For definition questions with multiple valid answers
    if (question.type === 'definition' && question.allAnswers && question.allAnswers.length > 0) {
      // Initialize matchedAnswers if it doesn't exist
      if (!question.matchedAnswers) {
        question.matchedAnswers = [];
      }
      
      let foundMatch = false;
      let matchedDefinition: string | undefined;
      
      // First, check for exact matches with any of the valid definitions
      matchedDefinition = question.allAnswers.find(answer => 
        this.textMatches(answer, userAnswer)
      );
      
      if (matchedDefinition) {
        foundMatch = true;
      } else {
        // If no exact match, split the user answer by spaces and check each word/phrase
        const userPhrases = this.extractPhrases(userAnswer);
        
        // Sort phrases by length (longest first) to prioritize specific matches over general ones
        const sortedPhrases = [...userPhrases].sort((a, b) => b.length - a.length);
        
        console.log(`User phrases extracted (sorted by length): ${sortedPhrases.join(', ')}`);
        console.log(`Checking against definitions: ${question.allAnswers.join(', ')}`);
        
        for (const phrase of sortedPhrases) {
          // Skip very short phrases that are unlikely to be meaningful
          if (phrase.length < 2) continue;
          
          // Check if any of the user's phrases match a definition
          matchedDefinition = question.allAnswers.find(answer => 
            this.textMatches(answer, phrase)
          );
          
          if (matchedDefinition) {
            console.log(`Match found! "${phrase}" matches definition "${matchedDefinition}"`);
            foundMatch = true;
            break;
          }
        }
      }
      
      if (foundMatch && matchedDefinition) {
        // If this is a new match (not already in matchedAnswers)
        if (!question.matchedAnswers.some(matched => this.textMatches(matched, matchedDefinition!))) {
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

  /**
   * Extract potential phrases from a string
   * This handles both individual words and multi-word phrases
   * For example, "armada group of ships" would produce:
   * ["armada group of ships", "armada", "group", "of", "ships", "group of", "of ships", "group of ships"]
   */
  private extractPhrases(input: string): string[] {
    if (!input) return [];
    
    const normalizedInput = input.trim().toLowerCase();
    if (!normalizedInput) return [];
    
    const words = normalizedInput.split(/\s+/);
    if (words.length <= 1) return [normalizedInput]; // Single word, no need to generate phrases
    
    // Start with the full input as a phrase
    const phrases: Set<string> = new Set([normalizedInput]);
    
    // Generate all possible contiguous word combinations
    for (let startIdx = 0; startIdx < words.length; startIdx++) {
      // Add individual word if long enough
      if (words[startIdx].length > 1) {
        phrases.add(words[startIdx]);
      }
      
      // Add all possible phrases starting at this word
      for (let endIdx = startIdx + 1; endIdx < words.length + 1; endIdx++) {
        const phrase = words.slice(startIdx, endIdx).join(' ');
        if (phrase !== normalizedInput) { // Don't add the full phrase twice
          phrases.add(phrase);
        }
      }
    }
    
    console.log(`Generated phrases for "${normalizedInput}": ${Array.from(phrases).join(', ')}`);
    return Array.from(phrases);
  }
}