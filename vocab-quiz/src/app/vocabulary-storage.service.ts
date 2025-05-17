import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VocabularyOpenAIResponse } from './ivocabulary-openai-response-interface';

@Injectable({ providedIn: 'root' })
export class VocabularyStorageService {
  private imageSubject = new BehaviorSubject<File | null>(null);
  private vocabSubject = new BehaviorSubject<VocabularyOpenAIResponse | null>(null);

  image$ = this.imageSubject.asObservable();
  vocab$ = this.vocabSubject.asObservable();

  setImage(file: File) {
    this.imageSubject.next(file);
  }

  getImage(): File | null {
    return this.imageSubject.value;
  }

  clearImage() {
    this.imageSubject.next(null);
  }

  setVocabulary(vocab: VocabularyOpenAIResponse) {
    this.vocabSubject.next(vocab);
  }

  getVocabulary(): VocabularyOpenAIResponse | null {
    return this.vocabSubject.value;
  }

  clearVocabulary() {
    this.vocabSubject.next(null);
  }

  clearAll() {
    this.clearImage();
    this.clearVocabulary();
  }

  /**
   * Validate the vocabulary for proper structure.
   * Returns an object with isValid and errors array.
   */
  validateVocabulary(vocab: VocabularyOpenAIResponse | null): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!vocab) {
      errors.push('Vocabulary is empty.');
      return { isValid: false, errors };
    }
    
    if (!vocab.vocabulary || !Array.isArray(vocab.vocabulary)) {
      errors.push('Invalid vocabulary format: missing vocabulary array.');
      return { isValid: false, errors };
    }
    
    if (vocab.vocabulary.length === 0) {
      errors.push('No vocabulary entries found.');
      return { isValid: false, errors };
    }
    
    let validRows = 0;
    vocab.vocabulary.forEach((entry, idx) => {
      if (!entry.word || typeof entry.word !== 'string') {
        errors.push(`Entry ${idx + 1} is missing a valid word.`);
      } else if (!entry.definitions || !Array.isArray(entry.definitions) || entry.definitions.length === 0) {
        errors.push(`Entry ${idx + 1} (${entry.word}) is missing valid definitions.`);
      } else {
        validRows++;
      }
    });
    
    if (validRows === 0) {
      errors.push('No valid vocabulary entries found.');
    }
    
    return { isValid: errors.length === 0, errors };
  }
} 