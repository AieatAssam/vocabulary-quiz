import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from './image-upload.component';
import { CameraCaptureComponent } from './camera-capture.component';

@Component({
  selector: 'app-image-test',
  standalone: true,
  imports: [CommonModule, ImageUploadComponent, CameraCaptureComponent],
  template: `
    <h2>Test Image Acquisition</h2>
    <app-image-upload (imageSelected)="onImage($event)"></app-image-upload>
    <app-camera-capture (imageCaptured)="onImage($event)"></app-camera-capture>
    <div *ngIf="imageUrl">
      <h3>Result Preview:</h3>
      <img [src]="imageUrl" style="max-width:300px;max-height:300px;border-radius:1rem;">
    </div>
  `
})
export class ImageTestComponent {
  imageUrl: string | null = null;

  onImage(file: File) {
    this.imageUrl = URL.createObjectURL(file);
  }
} 