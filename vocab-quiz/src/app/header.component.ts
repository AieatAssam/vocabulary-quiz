import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ApiSettingsComponent } from './api-settings.component';
import { ConfigurationService } from './configuration.service';

// Temporary shared state for wizard steps (to be replaced with a service)
const wizardState = {
  imageLoaded: false,
  quizStarted: false
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(
    private dialog: MatDialog,
    private config: ConfigurationService
  ) {}

  get configComplete(): boolean {
    return !!this.config.getApiKey() && !!this.config.getModel();
  }

  get imageLoaded(): boolean {
    return wizardState.imageLoaded;
  }

  get quizStarted(): boolean {
    return wizardState.quizStarted;
  }

  openSettings(): void {
    this.dialog.open(ApiSettingsComponent, {
      width: '400px',
      disableClose: false
    });
  }

  onLoadImageStep(): void {
    // stub for navigation or event
  }

  onDoQuizStep(): void {
    // stub for navigation or event
  }
}
