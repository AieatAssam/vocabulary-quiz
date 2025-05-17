import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VocabularyOpenAIResponse } from './ivocabulary-openai-response-interface';

const VOCABULARY_STORAGE_KEY = 'vocabulary_data';
const IMAGE_METADATA_KEY = 'vocabulary_image_metadata';

@Injectable({ providedIn: 'root' })
export class VocabularyStorageService {
  private imageSubject = new BehaviorSubject<File | null>(null);
  private vocabSubject = new BehaviorSubject<VocabularyOpenAIResponse | null>(null);

  image$ = this.imageSubject.asObservable();
  vocab$ = this.vocabSubject.asObservable();

  constructor() {
    // Initialize from localStorage if data exists
    this.loadFromStorage();
  }

  /**
   * Load vocabulary from localStorage if it exists
   */
  private loadFromStorage(): void {
    try {
      const storedVocab = localStorage.getItem(VOCABULARY_STORAGE_KEY);
      if (storedVocab) {
        const vocab: VocabularyOpenAIResponse = JSON.parse(storedVocab);
        this.vocabSubject.next(vocab);
      }
    } catch (error) {
      console.error('Error loading vocabulary from storage:', error);
      // Clear potentially corrupted data
      localStorage.removeItem(VOCABULARY_STORAGE_KEY);
    }
  }

  /**
   * Set a new image and clear any existing vocabulary
   */
  setImage(file: File) {
    // Clear existing vocabulary when a new image is uploaded
    this.clearVocabulary();
    this.imageSubject.next(file);
    
    // Store minimal image metadata as we can't store File objects in localStorage
    const imageMetadata = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(IMAGE_METADATA_KEY, JSON.stringify(imageMetadata));
  }

  getImage(): File | null {
    return this.imageSubject.value;
  }

  clearImage() {
    this.imageSubject.next(null);
    localStorage.removeItem(IMAGE_METADATA_KEY);
  }

  /**
   * Set vocabulary and persist to localStorage
   */
  setVocabulary(vocab: VocabularyOpenAIResponse) {
    this.vocabSubject.next(vocab);
    localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(vocab));
  }

  getVocabulary(): VocabularyOpenAIResponse | null {
    return this.vocabSubject.value;
  }

  clearVocabulary() {
    this.vocabSubject.next(null);
    localStorage.removeItem(VOCABULARY_STORAGE_KEY);
  }

  clearAll() {
    this.clearImage();
    this.clearVocabulary();
  }

  /**
   * Check if vocabulary data is available in localStorage
   */
  hasStoredVocabulary(): boolean {
    return localStorage.getItem(VOCABULARY_STORAGE_KEY) !== null;
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