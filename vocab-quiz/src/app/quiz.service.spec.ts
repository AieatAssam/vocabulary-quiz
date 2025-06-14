import { TestBed } from '@angular/core/testing';
import { QuizService, QuizQuestion } from './quiz.service';
import { VocabularyStorageService } from './vocabulary-storage.service';

describe('QuizService', () => {
  let service: QuizService;
  let mockVocabStorage: jasmine.SpyObj<VocabularyStorageService>;

  beforeEach(() => {
    // Create a mock VocabularyStorageService
    mockVocabStorage = jasmine.createSpyObj('VocabularyStorageService', ['getVocabulary']);
    
    // Mock the vocabulary data
    mockVocabStorage.getVocabulary.and.returnValue({
      vocabulary: [
        {
          word: 'fleet',
          definitions: ['armada', 'group of ships', 'collection of naval vessels']
        },
        {
          word: 'ambiguous',
          definitions: ['unclear', 'open to multiple interpretations']
        }
      ]
    });

    TestBed.configureTestingModule({
      providers: [
        QuizService,
        { provide: VocabularyStorageService, useValue: mockVocabStorage }
      ]
    });
    
    service = TestBed.inject(QuizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Multiple word definition matching', () => {
    let defQuestion: QuizQuestion;

    beforeEach(() => {
      // Create a definition-type question manually for testing
      defQuestion = {
        id: 1,
        type: 'definition',
        prompt: 'fleet',
        answer: 'armada', // Primary answer
        allAnswers: ['armada', 'group of ships', 'collection of naval vessels'],
        wordId: 'fleet'
      };
    });

    it('should match a complete multi-word definition', () => {
      // Access the private checkAnswer method using type assertion
      const result = (service as any).checkAnswer(defQuestion, 'group of ships');
      
      expect(result).toBeTrue();
      expect(defQuestion.matchedAnswers).toContain('group of ships');
      expect(defQuestion.isCorrect).toBeTrue();
    });

    it('should match when multiple definitions are provided in one answer', () => {
      // User types "armada group of ships"
      const result = (service as any).checkAnswer(defQuestion, 'armada group of ships');
      
      expect(result).toBeTrue();
      expect(defQuestion.matchedAnswers?.length).toBe(1); // At least one match
      // Either "armada" or "group of ships" should be in the matched answers
      const hasMatch = defQuestion.matchedAnswers?.some(m => 
        m === 'armada' || m === 'group of ships');
      expect(hasMatch).toBeTrue();
      expect(defQuestion.isCorrect).toBeTrue();
    });

    it('should track multiple separate answers correctly', () => {
      // First try with one answer
      (service as any).checkAnswer(defQuestion, 'armada');
      expect(defQuestion.matchedAnswers?.length).toBe(1);
      expect(defQuestion.matchedAnswers).toContain('armada');
      
      // Then try with another answer
      (service as any).checkAnswer(defQuestion, 'group of ships');
      expect(defQuestion.matchedAnswers?.length).toBe(2);
      expect(defQuestion.matchedAnswers).toContain('group of ships');
      
      // Check completeness calculation
      expect(defQuestion.completeness).toBeCloseTo(66.67, 0); // 2 out of 3 definitions
    });

    it('should not double-count the same definition', () => {
      // Answer with a phrase
      (service as any).checkAnswer(defQuestion, 'armada');
      expect(defQuestion.matchedAnswers?.length).toBe(1);
      
      // Answer with slightly different phrasing of the same definition
      (service as any).checkAnswer(defQuestion, 'ARMADA');  // Uppercase
      expect(defQuestion.matchedAnswers?.length).toBe(1); // Still just 1 match
    });

    it('should support extracting phrases from input', () => {
      const phrases = (service as any).extractPhrases('armada group of ships');
      
      // Should include the full phrase and combinations
      expect(phrases).toContain('armada group of ships'); // Full phrase
      expect(phrases).toContain('armada'); // Individual words
      expect(phrases).toContain('group');
      expect(phrases).toContain('ships');
      expect(phrases).toContain('group of ships'); // Multi-word combinations
      expect(phrases).toContain('armada group');
    });
  });
});
