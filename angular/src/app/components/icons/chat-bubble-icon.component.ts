import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-bubble-icon',
  standalone: true,
  template: `
    <svg [attr.class]="cls" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h6m5 8l-4-4H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12z" />
    </svg>
  `,
})
export class ChatBubbleIconComponent { @Input() cls?: string }

