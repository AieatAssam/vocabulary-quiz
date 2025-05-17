import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
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
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './api-settings.component.html',
  styleUrl: './api-settings.component.scss'
})
export class ApiSettingsComponent {
  form: FormGroup;
  models = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (default)' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'custom', label: 'Custom...' }
  ];

  get isCustomModel(): boolean {
    return this.form.get('model')?.value === 'custom';
  }

  constructor(
    private fb: FormBuilder,
    private config: ConfigurationService
  ) {
    const currentModel = this.config.getModel();
    this.form = this.fb.group({
      apiKey: [this.config.getApiKey(), Validators.required],
      endpoint: [this.config.getEndpoint()],
      model: [
        this.models.some(m => m.value === currentModel)
          ? currentModel
          : 'custom'
      ],
      customModel: [
        this.models.some(m => m.value === currentModel)
          ? ''
          : currentModel
      ]
    });
  }

  save(): void {
    if (this.form.valid) {
      const model = this.isCustomModel
        ? this.form.value.customModel
        : this.form.value.model;
      this.config.setApiKey(this.form.value.apiKey);
      this.config.setEndpoint(this.form.value.endpoint);
      this.config.setModel(model);
    }
  }
}
