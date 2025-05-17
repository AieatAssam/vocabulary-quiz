import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ApiSettingsComponent } from './api-settings.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private dialog: MatDialog) {}

  openSettings(): void {
    this.dialog.open(ApiSettingsComponent, {
      width: '400px',
      disableClose: false
    });
  }
}
