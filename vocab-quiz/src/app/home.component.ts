import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestTabsComponent } from './test-tabs.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TestTabsComponent],
  template: `<app-test-tabs></app-test-tabs>`
})
export class HomeComponent {}
