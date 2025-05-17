import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VocabularyStorageService } from './vocabulary-storage.service';

interface VocabRow {
  word: string;
  definition: string;
  error?: string;
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
    this.rows = this.parseRows(vocab || '');
    
    // Calculate summary based on parsed rows
    const validRows = this.rows.filter(r => !r.error).length;
    const invalidRows = this.rows.filter(r => r.error).length;
    const errors: string[] = [];
    
    if (!vocab || typeof vocab !== 'string') {
      errors.push('Vocabulary is empty or not a string.');
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

  private parseRows(vocab: string): VocabRow[] {
    if (!vocab) return [];
    const lines = vocab.split(/\r?\n/).filter(line => line.trim().length > 0);
    return lines.map((line, idx) => {
      const parts = line.split(/,|\t/).map(p => p.trim());
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return { word: parts[0] || '', definition: parts[1] || '', error: `Invalid format` };
      }
      return { word: parts[0], definition: parts[1] };
    });
  }
} 