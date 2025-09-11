import { Injectable, computed, signal } from '@angular/core';

// 最小 Signals/Service 狀態骨架，用於後續遷移 Pinia 狀態
export interface AiConfigState {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  // AI 設定（可日後補上 localStorage 持久化）
  private readonly _aiConfig = signal<AiConfigState>({
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
  });

  readonly aiConfig = computed(() => this._aiConfig());
  setAiConfig(partial: Partial<AiConfigState>) {
    this._aiConfig.update(current => ({ ...current, ...partial }));
  }

  // 簡易聊天訊息狀態
  private readonly _messages = signal<ChatMessage[]>([]);
  readonly messages = computed(() => this._messages());

  addMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'> & { id?: string }) {
    const id = msg.id ?? crypto.randomUUID();
    const createdAt = Date.now();
    this._messages.update(list => [...list, { ...msg, id, createdAt }]);
  }

  clearMessages() {
    this._messages.set([]);
  }
}

