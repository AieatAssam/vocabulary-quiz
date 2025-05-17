import { Component } from '@angular/core';
import { HeaderComponent } from './header.component';
import { RouterOutlet } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterOutlet, MatDialogModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
