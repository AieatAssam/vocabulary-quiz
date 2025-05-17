import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ImageTestComponent } from './image-test.component';
import { OpenAiTestComponent } from './openai-test.component';

@Component({
  selector: 'app-test-tabs',
  standalone: true,
  imports: [CommonModule, MatTabsModule, ImageTestComponent, OpenAiTestComponent],
  template: `
    <mat-tab-group>
      <mat-tab label="Image Upload & Camera">
        <app-image-test></app-image-test>
      </mat-tab>
      <mat-tab label="OpenAI Service">
        <app-openai-test></app-openai-test>
      </mat-tab>
    </mat-tab-group>
  `
})
export class TestTabsComponent {} 