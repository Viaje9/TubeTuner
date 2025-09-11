import { Component, EventEmitter, Input, Output, signal, ViewChild, ElementRef, ViewChildren, QueryList, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import type { SubtitleData } from '../../utils/srt-parser';
import { FavoritesService } from '../../state/favorites.service';

@Component({
  selector: 'app-subtitle-scroll',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './subtitle-scroll.component.html',
})
export class SubtitleScrollComponent implements OnChanges, AfterViewInit {
  @Input() subtitles: SubtitleData[] = [];
  @Input() currentTime = 0;
  @Input() isPlaying = false;
  @Input() videoId = '';
  @Output() seekTo = new EventEmitter<number>();

  private isUserScrolling = signal(false);
  private _timer: any;
  private lastIndex = -1;

  @ViewChild('container') container?: ElementRef<HTMLElement>;
  @ViewChildren('itemRef') itemRefs?: QueryList<ElementRef<HTMLElement>>;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTime'] || changes['subtitles']) {
      const idx = this.currentIndex;
      if (idx !== this.lastIndex && idx >= 0) {
        // 播放中或非使用者滾動時，將當前字幕滾動到容器頂部
        if (!this.isUserScrolling()) {
          this.scrollToIndex(idx);
        }
        this.lastIndex = idx;
      }
    }
  }

  ngAfterViewInit(): void {
    // 初次渲染後嘗試對齊
    queueMicrotask(() => {
      const idx = this.currentIndex;
      if (idx >= 0) this.scrollToIndex(idx, true);
    });
  }

  private scrollToIndex(index: number, instant = false) {
    const c = this.container?.nativeElement;
    const el = this.itemRefs?.get(index)?.nativeElement;
    if (!c || !el) return;
    const top = el.offsetTop; // 相對於可滾動容器內部
    c.scrollTo({ top, behavior: instant ? 'auto' : 'smooth' });
  }
}
