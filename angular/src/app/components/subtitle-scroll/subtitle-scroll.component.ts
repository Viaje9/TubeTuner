import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import type { SubtitleData } from '../../utils/srt-parser';
import { FavoritesService } from '../../state/favorites.service';

@Component({
  selector: 'app-subtitle-scroll',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './subtitle-scroll.component.html',
})
export class SubtitleScrollComponent {
  @Input() subtitles: SubtitleData[] = [];
  @Input() currentTime = 0;
  @Input() isPlaying = false;
  @Input() videoId = '';
  @Output() seekTo = new EventEmitter<number>();

  private isUserScrolling = signal(false);
  private _timer: any;

  constructor(public fav: FavoritesService) {}

  get currentIndex() {
    return this.subtitles.findIndex(
      s => this.currentTime >= s.startTime && this.currentTime <= s.endTime,
    );
  }

  isCurrent(s: SubtitleData) {
    return this.currentTime >= s.startTime && this.currentTime <= s.endTime;
  }

  onScroll(container: HTMLElement) {
    this.isUserScrolling.set(true);
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.isUserScrolling.set(false), 3000);
  }

  onSeek(s: SubtitleData) {
    this.seekTo.emit(s.startTime);
  }

  isFavorite(s: SubtitleData) {
    if (!this.videoId) return false;
    // 簡化判斷：以句子+時間作 key
    return this.fav.items().some(
      x => x.videoId === this.videoId && x.sentence === s.text && x.start === s.startTime && x.end === s.endTime,
    );
  }

  toggleFavorite(s: SubtitleData) {
    if (!this.videoId) return;
    if (this.isFavorite(s)) {
      // 直接依 index 移除最近的一筆相同條目
      const idx = this.fav.items().findIndex(
        x => x.videoId === this.videoId && x.sentence === s.text && x.start === s.startTime && x.end === s.endTime,
      );
      if (idx >= 0) this.fav.removeByIndex(idx);
    } else {
      this.fav.add({ id: `${this.videoId}:${s.index}`, sentence: s.text, start: s.startTime, end: s.endTime, videoId: this.videoId });
    }
  }
}

