import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { AppStateService } from '../../state/app-state.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './ai-chat.component.html',
})
export class AiChatComponent {
  readonly state = inject(AppStateService);
  input = '';

  send() {
    const text = this.input.trim();
    if (!text) return;
    this.state.addMessage({ role: 'user', content: text });
    this.input = '';
    // 後續接 OpenRouter 回覆
  }
}
