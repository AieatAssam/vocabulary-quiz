import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private apiKeySubject = new BehaviorSubject<string>('');
  private endpointSubject = new BehaviorSubject<string>('');
  private modelSubject = new BehaviorSubject<string>('gpt-4o-mini');

  apiKey$ = this.apiKeySubject.asObservable();
  endpoint$ = this.endpointSubject.asObservable();
  model$ = this.modelSubject.asObservable();

  setApiKey(key: string): void {
    this.apiKeySubject.next(key);
  }

  getApiKey(): string {
    return this.apiKeySubject.value;
  }

  setEndpoint(endpoint: string): void {
    this.endpointSubject.next(endpoint);
  }

  getEndpoint(): string {
    return this.endpointSubject.value;
  }

  setModel(model: string): void {
    this.modelSubject.next(model);
  }

  getModel(): string {
    return this.modelSubject.value;
  }
} 