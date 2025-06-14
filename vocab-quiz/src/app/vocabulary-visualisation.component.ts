import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatChipsModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './vocabulary-visualisation.component.html',
  styleUrls: ['./vocabulary-visualisation.component.scss']
})
export class VocabularyVisualisationComponent implements OnInit {
  vocabEntries: VocabEntry[] = [];
  displayedColumns = ['word', 'definitions', 'actions'];
  summary: { valid: number; invalid: number; errors: string[] } | null = null;
  
  // For adding new words
  newWord = '';
  newDefinition = '';
  newDefinitions: string[] = [];

  constructor(
    private vocabStorage: VocabularyStorageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadVocabulary();
  }
  
  loadVocabulary() {
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
  
  // Remove a vocabulary word
  removeWord(word: string) {
    if (confirm(`Are you sure you want to remove "${word}" from your vocabulary list?`)) {
      if (this.vocabStorage.removeVocabularyWord(word)) {
        this.snackBar.open(`Removed "${word}" from vocabulary`, 'Close', { duration: 3000 });
        this.loadVocabulary(); // Refresh the list
      } else {
        this.snackBar.open(`Failed to remove "${word}"`, 'Close', { duration: 3000 });
      }
    }
  }
  
  // Add a new definition to the temporary list
  addDefinition() {
    if (this.newDefinition.trim()) {
      this.newDefinitions.push(this.newDefinition.trim());
      this.newDefinition = '';
    }
  }
  
  // Remove a definition from the temporary list
  removeDefinition(index: number) {
    this.newDefinitions.splice(index, 1);
  }
  
  // Submit the new word with its definitions
  addNewWord() {
    if (this.newWord.trim() && this.newDefinitions.length > 0) {
      this.vocabStorage.addVocabularyWord(this.newWord.trim(), [...this.newDefinitions]);
      this.snackBar.open(`Added "${this.newWord}" to vocabulary`, 'Close', { duration: 3000 });
      
      // Reset form
      this.newWord = '';
      this.newDefinition = '';
      this.newDefinitions = [];
      
      // Refresh the vocabulary list
      this.loadVocabulary();
    } else {
      this.snackBar.open('Please enter a word and at least one definition', 'Close', { duration: 3000 });
    }
  }
  
  // Cancel adding a new word
  cancelAddWord() {
    this.newWord = '';
    this.newDefinition = '';
    this.newDefinitions = [];
  }
}