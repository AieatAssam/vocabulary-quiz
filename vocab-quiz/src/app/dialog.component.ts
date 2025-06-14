import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  title?: string;
  message: string;
  showCloseButton?: boolean;
  loading?: boolean;
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  template: `
    <h2 *ngIf="data.title" mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      <div *ngIf="data.loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      <div [innerHTML]="data.message" class="dialog-message" [class.loading-message]="data.loading"></div>
    </div>
    <div *ngIf="data.showCloseButton" mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="primary">Close</button>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    
    .dialog-message {
      color: #333;
    }
    
    .loading-message {
      margin-top: 16px;
      color: #666;
      text-align: center;
    }
    
    ul {
      margin-top: 0.5rem;
      padding-left: 1.5rem;
    }
    
    li {
      margin-bottom: 0.25rem;
    }
  `]
})
export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
} 