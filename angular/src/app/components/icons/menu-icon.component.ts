import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu-icon',
  standalone: true,
  template: `
    <svg [attr.class]="cls" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  `,
})
export class MenuIconComponent { @Input() cls?: string }

