import { Component, ElementRef, EventEmitter, Output, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-camera-capture',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './camera-capture.component.html',
  styleUrl: './camera-capture.component.scss'
})
export class CameraCaptureComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() imageCaptured = new EventEmitter<File>();

  stream: MediaStream | null = null;
  error: string | null = null;
  previewUrl: string | null = null;

  async ngAfterViewInit() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoRef.nativeElement.srcObject = this.stream;
      await this.videoRef.nativeElement.play();
    } catch (err) {
      this.error = 'Unable to access camera.';
    }
  }

  capture() {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) {
          this.previewUrl = URL.createObjectURL(blob);
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          this.imageCaptured.emit(file);
        }
      }, 'image/jpeg');
    }
  }

  clear() {
    this.previewUrl = null;
    if (this.videoRef && this.videoRef.nativeElement.paused) {
      this.videoRef.nativeElement.play();
    }
  }

  ngOnDestroy() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}
