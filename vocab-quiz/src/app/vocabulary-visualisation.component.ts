import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { VocabularyStorageService } from './vocabulary-storage.service';
import { VocabularyOpenAIResponse } from './ivocabulary-openai-response-interface';

interface VocabEntry {
  word: string;
  definitions: string[];
  error?: string | undefined;
}

@Component({
  selector: 'app-vocabulary-visualisation',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './vocabulary-visualisation.component.html',
  styleUrls: ['./vocabulary-visualisation.component.scss']
})
export class VocabularyVisualisationComponent implements OnInit {
  vocabEntries: VocabEntry[] = [];
  displayedColumns = ['word', 'definitions', 'actions'];
  summary: { valid: number; invalid: number; errors: string[] } | null = null;

  constructor(private vocabStorage: VocabularyStorageService) {}

  ngOnInit() {
    const vocab = this.vocabStorage.getVocabulary();
    this.vocabEntries = this.parseVocabulary(vocab);
    
    // Calculate summary based on parsed entries
    const validEntries = this.vocabEntries.filter(e => !e.error).length;
    const invalidEntries = this.vocabEntries.filter(e => e.error).length;
    const errors: string[] = [];
    
    if (!vocab) {
      errors.push('Vocabulary is empty.');
    } else if (this.vocabEntries.length === 0) {
      errors.push('No vocabulary entries found.');
    } else if (invalidEntries > 0) {
      errors.push(`${invalidEntries} invalid entries found.`);
    }
    
    this.summary = {
      valid: validEntries,
      invalid: invalidEntries,
      errors
    };
  }

  private parseVocabulary(vocab: VocabularyOpenAIResponse | null): VocabEntry[] {
    if (!vocab || !vocab.vocabulary || !Array.isArray(vocab.vocabulary)) return [];
    
    return vocab.vocabulary.map(entry => {
      if (!entry.word || !entry.definitions || !Array.isArray(entry.definitions) || entry.definitions.length === 0) {
        return {
          word: entry.word || '',
          definitions: [],
          error: 'Invalid entry format'
        };
      } else {
        return {
          word: entry.word,
          definitions: entry.definitions,
          error: undefined
        };
      }
    });
  }
} 