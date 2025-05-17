import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from './image-upload.component';
import { CameraCaptureComponent } from './camera-capture.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ImageUploadComponent, CameraCaptureComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  imageUrl: string | null = null;

  onImage(file: File) {
    this.imageUrl = URL.createObjectURL(file);
  }
}
