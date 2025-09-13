import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MenuIconComponent } from '../../components/icons/menu-icon.component';
import { GenAIService } from '../../services/genai.service';
import { AppStateService } from '../../state/app-state.service';

@Component({
  selector: 'app-ai-settings',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, MenuIconComponent, RouterLink],
  templateUrl: './ai-settings.component.html',
})
export class AiSettingsComponent {
  readonly state = inject(AppStateService);
  readonly genai = inject(GenAIService);
  private _snackBar = inject(MatSnackBar);

  // 本地 UI 狀態
  localApiKey = this.state.aiConfig().apiKey;
  showApiKey = false;
  showAdvanced = false;
  isSaving = false;
  error = '';

  clearError() {
    this.error = '';
  }

  async saveSettings() {
    const key = (this.localApiKey ?? '').trim();
    if (!key) return;
    this.isSaving = true;
    this.error = '';
    try {
      this.state.setAiConfig({ apiKey: key });
      this.state.saveToStorage();
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    } finally {
      this._snackBar.open('設定已儲存', undefined, { duration: 2000, verticalPosition: 'top' });
      this.isSaving = false;
    }
  }

  async reloadModels() {
    try {
      await this.state.loadAvailableModels(() => this.genai.listModels(), true);
    } catch {}
  }

  resetSettings() {
    if (confirm('確定要重置所有 AI 設定嗎？這將清除您的 API Key 和所有自訂設定。')) {
      this.state.resetConfig();
      this.localApiKey = '';
      this.showApiKey = false;
      this.showAdvanced = false;
      this.error = '';
    }
  }
}
