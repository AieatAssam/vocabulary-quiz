import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const API_KEY_KEY = 'vocabQuizApiKey';
const ENDPOINT_KEY = 'vocabQuizEndpoint';
const MODEL_KEY = 'vocabQuizModel';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private apiKeySubject = new BehaviorSubject<string>(sessionStorage.getItem(API_KEY_KEY) || '');
  private endpointSubject = new BehaviorSubject<string>(sessionStorage.getItem(ENDPOINT_KEY) || '');
  private modelSubject = new BehaviorSubject<string>(sessionStorage.getItem(MODEL_KEY) || 'gpt-4o-mini');

  apiKey$ = this.apiKeySubject.asObservable();
  endpoint$ = this.endpointSubject.asObservable();
  model$ = this.modelSubject.asObservable();

  setApiKey(key: string): void {
    this.apiKeySubject.next(key);
    sessionStorage.setItem(API_KEY_KEY, key);
  }

  getApiKey(): string {
    return this.apiKeySubject.value;
  }

  setEndpoint(endpoint: string): void {
    this.endpointSubject.next(endpoint);
    sessionStorage.setItem(ENDPOINT_KEY, endpoint);
  }

  getEndpoint(): string {
    return this.endpointSubject.value;
  }

  setModel(model: string): void {
    this.modelSubject.next(model);
    sessionStorage.setItem(MODEL_KEY, model);
  }

  getModel(): string {
    return this.modelSubject.value;
  }
} 