import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VocabularyStorageService } from './vocabulary-storage.service';
import { VocabularyOpenAIResponse } from './ivocabulary-openai-response-interface';

interface VocabRow {
  word: string;
  definition: string;
  error?: string | undefined;
}

@Component({
  selector: 'app-vocabulary-visualisation',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './vocabulary-visualisation.component.html',
  styleUrls: ['./vocabulary-visualisation.component.scss']
})
export class VocabularyVisualisationComponent implements OnInit {
  rows: VocabRow[] = [];
  displayedColumns = ['word', 'definition', 'error'];
  summary: { valid: number; invalid: number; errors: string[] } | null = null;

  constructor(private vocabStorage: VocabularyStorageService) {}

  ngOnInit() {
    const vocab = this.vocabStorage.getVocabulary();
    this.rows = this.parseRows(vocab);
    
    // Calculate summary based on parsed rows
    const validRows = this.rows.filter(r => !r.error).length;
    const invalidRows = this.rows.filter(r => r.error).length;
    const errors: string[] = [];
    
    if (!vocab) {
      errors.push('Vocabulary is empty.');
    } else if (this.rows.length === 0) {
      errors.push('No vocabulary entries found.');
    } else if (invalidRows > 0) {
      errors.push(`${invalidRows} invalid entries found.`);
    }
    
    this.summary = {
      valid: validRows,
      invalid: invalidRows,
      errors
    };
  }

  private parseRows(vocab: VocabularyOpenAIResponse | null): VocabRow[] {
    if (!vocab || !vocab.vocabulary || !Array.isArray(vocab.vocabulary)) return [];
    
    const result: VocabRow[] = [];
    
    vocab.vocabulary.forEach((entry) => {
      if (!entry.word || !entry.definitions || !Array.isArray(entry.definitions) || entry.definitions.length === 0) {
        result.push({
          word: entry.word || '',
          definition: '',
          error: 'Invalid entry format'
        });
      } else {
        // Create a row for each definition
        entry.definitions.forEach((def) => {
          result.push({
            word: entry.word,
            definition: def,
            error: undefined
          });
        });
      }
    });
    
    return result;
  }
} 