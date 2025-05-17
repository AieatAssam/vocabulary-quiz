import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VocabularyStorageService {
  private imageSubject = new BehaviorSubject<File | null>(null);
  private vocabSubject = new BehaviorSubject<string | null>(null);

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

  setVocabulary(vocab: string) {
    this.vocabSubject.next(vocab);
  }

  getVocabulary(): string | null {
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
   * Validate the vocabulary string for two-column format (word, definition).
   * Returns an object with isValid and errors array.
   */
  validateVocabulary(vocab: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!vocab || typeof vocab !== 'string') {
      errors.push('Vocabulary is empty or not a string.');
      return { isValid: false, errors };
    }
    const lines = vocab.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      errors.push('No vocabulary entries found.');
      return { isValid: false, errors };
    }
    let validRows = 0;
    lines.forEach((line, idx) => {
      // Accept comma or tab as separator
      const parts = line.split(/,|\t/).map(p => p.trim());
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        errors.push(`Line ${idx + 1} is not a valid word, definition pair: "${line}"`);
      } else {
        validRows++;
      }
    });
    if (validRows === 0) {
      errors.push('No valid word-definition pairs found.');
    }
    return { isValid: errors.length === 0, errors };
  }
} 