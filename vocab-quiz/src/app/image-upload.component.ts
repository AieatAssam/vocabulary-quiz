import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss'
})
export class ImageUploadComponent {
  @Output() imageSelected = new EventEmitter<File>();
  previewUrl: string | null = null;
  error: string | null = null;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.error = 'No file selected.';
      return;
    }
    const file = input.files[0];
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.error = 'Only JPG and PNG images are allowed.';
      this.previewUrl = null;
      return;
    }
    this.error = null;
    this.imageSelected.emit(file);
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clear(): void {
    this.previewUrl = null;
    this.error = null;
  }
}
