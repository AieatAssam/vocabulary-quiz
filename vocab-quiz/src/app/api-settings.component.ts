import { Component, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfigurationService } from './configuration.service';
import { MatDialogRef } from '@angular/material/dialog';

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
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    { value: 'o4-mini', label: 'o4 Mini' },
    { value: 'custom', label: 'Custom...' }
  ];

  get isCustomModel(): boolean {
    return this.form.get('model')?.value === 'custom';
  }

  constructor(
    private fb: FormBuilder,
    private config: ConfigurationService,
    @Optional() private dialogRef?: MatDialogRef<ApiSettingsComponent>
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
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    }
  }
}
