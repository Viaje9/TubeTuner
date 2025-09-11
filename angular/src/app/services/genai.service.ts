import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { AppStateService, type ChatMessage as AppChatMessage } from '../state/app-state.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class GenAIService {
  private client: GoogleGenAI | null = null;
  private lastKey = '';
  private readonly state = inject(AppStateService);

  private ensureClient() {
    const apiKey = this.state.aiConfig().apiKey;
    if (!apiKey) throw new Error('尚未設定 API Key');
    if (!this.client || this.lastKey !== apiKey) {
      this.client = new GoogleGenAI({ apiKey });
      this.lastKey = apiKey;
    }
  }

  private convertMessages(messages: ChatMessage[]) {
    const systemMessages: string[] = [];
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const m of messages) {
      if (m.role === 'system') systemMessages.push(m.content);
      else contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
    }
    return {
      contents,
      systemInstruction: systemMessages.length > 0 ? [{ text: systemMessages.join('\n\n') }] : undefined,
    } as const;
  }

  async chatCompletion(opts: { model: string; messages: ChatMessage[]; temperature?: number; maxTokens?: number; }): Promise<string> {
    this.ensureClient();
    const { contents, systemInstruction } = this.convertMessages(opts.messages);
    const response = await this.client!.models.generateContent({
      model: opts.model,
      contents,
      config: {
        systemInstruction,
        ...(opts.temperature !== undefined && { temperature: opts.temperature }),
        ...(opts.maxTokens !== undefined && { maxOutputTokens: opts.maxTokens }),
      },
    });
    return response.text || '';
  }
}

