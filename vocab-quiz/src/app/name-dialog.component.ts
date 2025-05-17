import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface NameDialogData {
  name: string;
}

@Component({
  selector: 'app-name-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Certificate Information</h2>
    <div mat-dialog-content>
      <p>Please enter your name for the certificate:</p>
      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>Your Name</mat-label>
        <input matInput [(ngModel)]="data.name" placeholder="John Doe">
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!data.name.trim()" (click)="onConfirm()">Confirm</button>
    </div>
  `
})
export class NameDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<NameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NameDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.data.name.trim()) {
      this.dialogRef.close(this.data.name);
    }
  }
} 