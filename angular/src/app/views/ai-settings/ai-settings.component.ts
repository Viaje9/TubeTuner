import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../state/app-state.service';

@Component({
  selector: 'app-ai-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ai-settings.component.html',
})
export class AiSettingsComponent {
  readonly state = inject(AppStateService);
  model = this.state.aiConfig().model;
  apiKey = this.state.aiConfig().apiKey;
  temperature = this.state.aiConfig().temperature;

  save() {
    this.state.setAiConfig({ model: this.model, apiKey: this.apiKey, temperature: this.temperature });
  }
}
