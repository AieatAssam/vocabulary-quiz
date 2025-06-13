import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SecureStorageService } from './secure-storage.service';

const API_KEY_KEY = 'vocabQuizApiKey';
const ENDPOINT_KEY = 'vocabQuizEndpoint';
const MODEL_KEY = 'vocabQuizModel';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private apiKeySubject: BehaviorSubject<string>;
  private endpointSubject: BehaviorSubject<string>;
  private modelSubject: BehaviorSubject<string>;
  
  apiKey$: import('rxjs').Observable<string>;
  endpoint$: import('rxjs').Observable<string>;
  model$: import('rxjs').Observable<string>;
  
  constructor(private secureStorage: SecureStorageService) {
    this.apiKeySubject = new BehaviorSubject<string>(this.secureStorage.getItem(API_KEY_KEY) || '');
    this.endpointSubject = new BehaviorSubject<string>(this.secureStorage.getItem(ENDPOINT_KEY) || '');
    this.modelSubject = new BehaviorSubject<string>(this.secureStorage.getItem(MODEL_KEY) || 'gpt-4o-mini');
    
    this.apiKey$ = this.apiKeySubject.asObservable();
    this.endpoint$ = this.endpointSubject.asObservable();
    this.model$ = this.modelSubject.asObservable();
  }

  setApiKey(key: string): void {
    this.apiKeySubject.next(key);
    this.secureStorage.setItem(API_KEY_KEY, key);
  }

  getApiKey(): string {
    return this.apiKeySubject.value;
  }

  setEndpoint(endpoint: string): void {
    this.endpointSubject.next(endpoint);
    this.secureStorage.setItem(ENDPOINT_KEY, endpoint);
  }

  getEndpoint(): string {
    return this.endpointSubject.value;
  }

  setModel(model: string): void {
    this.modelSubject.next(model);
    this.secureStorage.setItem(MODEL_KEY, model);
  }

  getModel(): string {
    return this.modelSubject.value;
  }
  
  /**
   * Clears all stored settings
   */
  clearSettings(): void {
    this.setApiKey('');
    this.setEndpoint('');
    this.setModel('gpt-4o-mini');
  }
}