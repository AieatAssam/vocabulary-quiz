import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ApiSettingsComponent } from './api-settings.component';
import { ConfigurationService } from './configuration.service';
import { VocabularyStorageService } from './vocabulary-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  imageLoaded = false;
  quizStarted = false;

  constructor(
    private dialog: MatDialog,
    private config: ConfigurationService,
    private vocabStorage: VocabularyStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to vocabulary changes to track image status
    this.vocabStorage.vocab$.subscribe(vocab => {
      this.imageLoaded = !!vocab;
    });
  }

  get configComplete(): boolean {
    return !!this.config.getApiKey() && !!this.config.getModel();
  }

  openSettings(): void {
    this.dialog.open(ApiSettingsComponent, {
      width: '400px',
      disableClose: false
    });
  }

  onLoadImageStep(): void {
    if (this.configComplete) {
      this.router.navigate(['/']);
    }
  }

  onDoQuizStep(): void {
    if (this.imageLoaded) {
      // Navigate to quiz component (to be implemented)
      console.log('Navigate to quiz component');
      // For now, just mark as started
      this.quizStarted = true;
    }
  }
}
