import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { AppStateService } from '../../state/app-state.service';
import { GenAIService } from '../../services/genai.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './ai-chat.component.html',
})
export class AiChatComponent {
  readonly state = inject(AppStateService);
  readonly genai = inject(GenAIService);
  @Input({ required: true }) onBack!: () => void;
  input = '';
  // 載入中指示（送出問題等待回覆期間顯示 … 氣泡）
  isThinking = false;

  constructor() {
    // 進入畫面時若有待處理上下文，注入為 system 訊息
    const pending = this.state.consumePendingContext();
    if (pending.length > 0) {
      for (const m of pending) {
        this.state.addMessage({ role: m.role, content: m.content });
      }
    }
  }

  // 清空目前對話訊息
  clear() {
    if (this.isThinking) return;
    this.state.clearMessages();
  }

  send() {
    const text = this.input.trim();
    if (!text) return;
    if (this.isThinking) return; // 避免重複觸發
    this.state.addMessage({ role: 'user', content: text });
    this.input = '';
    // 送到 GenAI
    const cfg = this.state.aiConfig();
    const systemPrompt = cfg.systemPrompt?.trim();
    const baseMessages = this.state.messages().map(m => ({ role: m.role, content: m.content }));
    const messages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...baseMessages]
      : baseMessages;
    this.isThinking = true;
    this.genai
      .chatCompletion({
        model: cfg.model,
        messages,
        temperature: cfg.temperature,
        maxTokens: cfg.maxTokens,
      })
      .then(reply => {
        if (reply) this.state.addMessage({ role: 'assistant', content: reply });
      })
      .catch(err => {
        const msg = err instanceof Error ? err.message : String(err);
        this.state.addMessage({ role: 'system', content: `錯誤：${msg}` });
      })
      .finally(() => {
        this.isThinking = false;
      });
  }
}
