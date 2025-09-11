import { Component, Input } from '@angular/core';
import type { SubtitleData } from '../../utils/srt-parser';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-subtitle-display',
  standalone: true,
  imports: [NgIf],
  templateUrl: './subtitle-display.component.html',
})
export class SubtitleDisplayComponent {
  @Input() currentSubtitle: SubtitleData | null = null;
  @Input() fontSize = 18;
  @Input() position: 'top' | 'bottom' = 'bottom';
  @Input() positionStyle: 'absolute' | 'relative' | 'static' = 'absolute';
  @Input() textColorClass = 'text-white';
  @Input() backgroundClass = 'bg-black/60 border border-gray-800/30';

  get formattedText() {
    return (this.currentSubtitle?.text || '').replace(/\\n|\n/g, '<br>');
  }
}

