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
} 