import { Component, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubtitleDisplayComponent } from '../../components/subtitle-display/subtitle-display.component';
import { SubtitleScrollComponent } from '../../components/subtitle-scroll/subtitle-scroll.component';
import { parseSRT, getCurrentSubtitle, type SubtitleData } from '../../utils/srt-parser';
import { parseJSONSubtitles } from '../../utils/json-subtitle-parser';

@Component({
  selector: 'app-local-video',
  standalone: true,
  imports: [CommonModule, RouterLink, SubtitleDisplayComponent, SubtitleScrollComponent],
  templateUrl: './local-video.component.html',
})
export class LocalVideoComponent {
  @ViewChild('video', { static: false }) videoRef?: ElementRef<HTMLVideoElement>;
  src = signal<string | null>(null);
  rate = signal<number>(1);
  // 字幕狀態
  subtitles = signal<SubtitleData[]>([]);
  currentTime = signal(0);
  isPlaying = signal(false);
  videoId = signal<string>('');
  currentSubtitle = computed(() => getCurrentSubtitle(this.subtitles(), this.currentTime()));
  showSubtitlePanel = signal(true);
  get hasVideoLoaded() { return !!this.src(); }
  get hasSubtitles() { return this.subtitles().length > 0; }

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    this.src.set(url);
    this.videoId.set(file.name || 'local-video');
  }

  setRate(r: number) {
    this.rate.set(r);
    const v = this.videoRef?.nativeElement;
    if (v) v.playbackRate = r;
  }

  onTimeUpdate() {
    const v = this.videoRef?.nativeElement;
    if (v) this.currentTime.set(v.currentTime);
  }

  onPlay() { this.isPlaying.set(true); }
  onPause() { this.isPlaying.set(false); }

  async onSubtitleFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      let parsed: SubtitleData[] = [];
      if (/\.srt$/i.test(file.name)) {
        parsed = parseSRT(text);
      } else if (/\.json$/i.test(file.name)) {
        parsed = parseJSONSubtitles(text);
      } else {
        // 嘗試 JSON -> SRT
        try { parsed = parseJSONSubtitles(text); } catch { parsed = parseSRT(text); }
      }
      this.subtitles.set(parsed);
    } catch (err) {
      console.error('載入字幕失敗', err);
    }
  }

  seekTo(time: number) {
    const v = this.videoRef?.nativeElement;
    if (v) v.currentTime = time;
  }

  toggleSubtitlePanel() {
    this.showSubtitlePanel.set(!this.showSubtitlePanel());
  }

  formatTime(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
      : `${m}:${s.toString().padStart(2,'0')}`;
  }
}
