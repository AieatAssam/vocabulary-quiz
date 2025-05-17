import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigurationService } from './configuration.service';

@Component({
  selector: 'app-api-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './api-settings.component.html',
  styleUrl: './api-settings.component.scss'
})
export class ApiSettingsComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private config: ConfigurationService
  ) {
    this.form = this.fb.group({
      apiKey: [this.config.getApiKey(), Validators.required],
      endpoint: [this.config.getEndpoint()],
      model: [this.config.getModel()]
    });
  }

  save(): void {
    if (this.form.valid) {
      this.config.setApiKey(this.form.value.apiKey);
      this.config.setEndpoint(this.form.value.endpoint);
      this.config.setModel(this.form.value.model);
    }
  }
}
