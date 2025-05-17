import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface DialogData {
  message: string;
}

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="loading-dialog">
      <mat-spinner diameter="40"></mat-spinner>
      <p class="loading-message">{{ data.message }}</p>
    </div>
  `,
  styles: [`
    .loading-dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
    }
    
    .loading-message {
      margin-top: 16px;
      color: #666;
    }
  `]
})
export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
} 