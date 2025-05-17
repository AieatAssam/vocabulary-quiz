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
  template: `
    <mat-card class="vocab-card">
      <h2>Vocabulary Visualisation</h2>
      <div *ngIf="summary">
        <div class="summary">
          <span><mat-icon color="primary">check_circle</mat-icon> Valid: {{summary.valid}}</span>
          <span><mat-icon color="warn">error</mat-icon> Invalid: {{summary.invalid}}</span>
        </div>
        <div *ngIf="summary.errors.length > 0" class="error-list">
          <mat-icon color="warn">warning</mat-icon>
          <span *ngFor="let err of summary.errors">{{err}}</span>
        </div>
      </div>
      <table mat-table [dataSource]="rows" class="mat-elevation-z2">
        <ng-container matColumnDef="word">
          <th mat-header-cell *matHeaderCellDef>Word</th>
          <td mat-cell *matCellDef="let row" [class.error-row]="row.error">{{row.word}}</td>
        </ng-container>
        <ng-container matColumnDef="definition">
          <th mat-header-cell *matHeaderCellDef>Definition</th>
          <td mat-cell *matCellDef="let row" [class.error-row]="row.error">{{row.definition}}</td>
        </ng-container>
        <ng-container matColumnDef="error">
          <th mat-header-cell *matHeaderCellDef>Error</th>
          <td mat-cell *matCellDef="let row">{{row.error || ''}}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.error-row]="row.error"></tr>
      </table>
      <div class="actions">
        <button mat-raised-button color="primary" [disabled]="summary && summary.invalid > 0">Confirm Vocabulary</button>
      </div>
    </mat-card>
  `,
  styles: [`
    .vocab-card { max-width: 700px; margin: 2rem auto; padding: 2rem; }
    .summary { display: flex; gap: 2rem; margin-bottom: 1rem; font-size: 1.1rem; }
    .error-list { color: #d32f2f; margin-bottom: 1rem; }
    .error-row { background: #fff3e0 !important; }
    table { width: 100%; margin-bottom: 1rem; }
    .actions { text-align: right; }
  `]
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