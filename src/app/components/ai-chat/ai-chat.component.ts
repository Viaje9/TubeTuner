import { NgClass, NgFor } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { interval, Subscription } from 'rxjs';
import { ChatMessage, GenAIService } from '../../services/genai.service';
import { AppStateService } from '../../state/app-state.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [FormsModule, NgFor, NgClass],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.scss',
})
export class AiChatComponent implements OnDestroy {
  readonly state = inject(AppStateService);
  readonly genai = inject(GenAIService);
  readonly renderer = inject(Renderer2);
  private sanitizer = inject(DomSanitizer);

  @Input({ required: true }) onBack!: () => void;
  @ViewChild('inputEl', { static: true }) inputEl!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('messagesEl', { static: true }) messagesEl!: ElementRef<HTMLDivElement>;

  input = '';
  // 載入中指示（送出問題等待回覆期間顯示 … 氣泡）
  isThinking = false;
  thinkingDots = '.';
  private thinkingSubscription?: Subscription;
  private scrollHandler = (e: Event) => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };
  private isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

  constructor() {
    // 進入畫面時若有待處理上下文，注入為 system 訊息
    const pending = this.state.consumePendingContext();
    if (pending.length > 0) {
      for (const m of pending) {
        this.state.addMessage({ role: m.role, content: m.content });
      }
    }

    window.addEventListener('scroll', this.scrollHandler);
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
    // 重置 textarea 高度
    this.resetTextareaHeight();
    // 送到 GenAI
    const cfg = this.state.aiConfig();
    const systemPrompt = cfg.systemPrompt?.trim();
    const baseMessages = this.state.messages().map(m => ({ role: m.role, content: m.content }));
    const messages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...baseMessages]
      : baseMessages;
    this.isThinking = true;
    this.startThinkingAnimation();
    this.scrollToBottom();
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
        this.stopThinkingAnimation();
        console.log(this.state.messages());
        // 滾動到底部
        this.scrollToBottom();
      });
  }

  renderMessageContent(message: ChatMessage): SafeHtml {
    // 對於模型的輸出，先用 marked 解析，再用 sanitizer 淨化
    const rawHtml = marked.parse(message.content) as string;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = this.messagesEl.nativeElement;
      if (messagesContainer) {
        messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  }

  focusInput(): void {
    if (!this.isIOS || typeof window === 'undefined' || !window.visualViewport) return;

    setTimeout(() => {
      window.scrollTo({ top: 0 });
    }, 100);

    // 取得當前 textarea 高度並調整訊息容器
    const textarea = this.inputEl.nativeElement;
    const currentHeight = textarea ? textarea.scrollHeight : 52;
    this.adjustMessagesContainerHeight(currentHeight + 350); // iOS 鍵盤補償
  }

  blurInput(): void {
    setTimeout(() => {
      // 取得當前 textarea 高度並調整訊息容器
      const textarea = this.inputEl.nativeElement;
      const currentHeight = textarea ? textarea.scrollHeight : 52;
      this.adjustMessagesContainerHeight(currentHeight);
    }, 50);
  }

  adjustTextareaHeight(): void {
    const textarea = this.inputEl.nativeElement;
    if (!textarea) return;

    // 重置高度以計算實際需要的高度
    textarea.style.height = 'auto';

    // 設定新的高度，但限制在最大高度範圍內
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 200; // 對應 CSS 中的 max-h-[200px]
    const newHeight = Math.min(scrollHeight, maxHeight);

    textarea.style.height = newHeight + 'px';

    // 動態調整訊息容器高度
    this.adjustMessagesContainerHeight(newHeight + 350);
  }

  resetTextareaHeight(): void {
    const textarea = this.inputEl.nativeElement;
    if (!textarea) return;
    textarea.style.height = 'auto';
    // 重置訊息容器高度
    this.adjustMessagesContainerHeight(52); // 預設最小高度
  }

  private adjustMessagesContainerHeight(textareaHeight: number): void {
    const messagesContainer = this.messagesEl.nativeElement;
    if (!messagesContainer) return;

    // 計算訊息容器的高度：總高度 - 標題高度 - 輸入區域高度 - 額外邊距
    const titleHeight = 80; // 標題區域約 80px
    const inputAreaPadding = 20; // 輸入區域的 padding 和 margin
    const extraPadding = 10; // 額外邊距
    const totalInputHeight = textareaHeight + inputAreaPadding;

    const newContainerHeight = `calc(100dvh - ${titleHeight + totalInputHeight + extraPadding}px)`;
    this.renderer.setStyle(messagesContainer, 'height', newContainerHeight);
  }

  private startThinkingAnimation(): void {
    this.thinkingDots = '.';
    this.thinkingSubscription?.unsubscribe();
    this.thinkingSubscription = interval(300).subscribe(() => {
      this.thinkingDots = this.thinkingDots.length < 3 ? this.thinkingDots + '.' : '.';
    });
  }

  private stopThinkingAnimation(): void {
    this.thinkingSubscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.stopThinkingAnimation();
    window.removeEventListener('scroll', this.scrollHandler);
  }
}
