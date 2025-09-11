import { Component, ViewChild, ElementRef, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubtitleScrollComponent } from '../../components/subtitle-scroll/subtitle-scroll.component';
import { parseSRT, getCurrentSubtitle, type SubtitleData } from '../../utils/srt-parser';
import { parseJSONSubtitles } from '../../utils/json-subtitle-parser';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PlayerSettingsDialogComponent } from '../../components/play-settings-dialog/play-settings-dialog.component';
import { PlayerPreferencesService } from '../../state/player-preferences.service';

@Component({
  selector: 'app-local-video',
  standalone: true,
  imports: [CommonModule, RouterLink, SubtitleScrollComponent, MatDialogModule],
  templateUrl: './local-video.component.html',
})
export class LocalVideoComponent {
  @ViewChild('video', { static: false }) videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('videoFileInput') videoFileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('subtitleFileInput') subtitleFileInput?: ElementRef<HTMLInputElement>;
  src = signal<string | null>(null);
  rate = signal<number>(1);
  // 字幕狀態
  subtitles = signal<SubtitleData[]>([]);
  currentTime = signal(0);
  isPlaying = signal(false);
  isReady = signal(false);
  videoId = signal<string>('');
  currentSubtitle = computed(() => getCurrentSubtitle(this.subtitles(), this.currentTime()));
  showSubtitlePanel = signal(true);
  constructor(private dialog: MatDialog, public prefs: PlayerPreferencesService) {}
  get hasVideoLoaded() { return !!this.src(); }
  get hasSubtitles() { return this.subtitles().length > 0; }
  // 上傳/拖放狀態
  isDragging = signal(false);
  private dragCounter = 0;
  // 已選字幕檔案（等待上傳）
  selectedSubtitleFile = signal<File | null>(null);
  isUploadingSubtitle = signal(false);
  // 影片資訊
  videoFileName = signal<string>('');
  videoFileSize = signal<number>(0);
  videoFileType = signal<string>('');

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.handleVideoFile(file);
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
  onLoadedMetadata() {
    this.isReady.set(true);
    const v = this.videoRef?.nativeElement;
    if (v) v.playbackRate = this.prefs.playbackRate();
  }

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

  openSettings() {
    const ref = this.dialog.open(PlayerSettingsDialogComponent, {
      panelClass: 'tt-material-dialog',
      width: '560px',
      maxWidth: '92vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result?.playbackRate) {
        const v = this.videoRef?.nativeElement;
        if (v) v.playbackRate = result.playbackRate;
        this.rate.set(result.playbackRate);
      }
    });
  }

  // live-apply preference changes while dialog is open
  liveRateEffect = effect(() => {
    const rate = this.prefs.playbackRate();
    const v = this.videoRef?.nativeElement;
    if (v) {
      v.playbackRate = rate;
      this.rate.set(rate);
    }
  });

  formatTime(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
      : `${m}:${s.toString().padStart(2,'0')}`;
  }

  // 底部播放控制條
  rewindClicked = signal(false);
  forwardClicked = signal(false);

  handleRewind() {
    const v = this.videoRef?.nativeElement;
    if (!v) return;
    const step = this.prefs.seekStep();
    v.currentTime = Math.max(0, v.currentTime - step);
    this.rewindClicked.set(true);
    setTimeout(() => this.rewindClicked.set(false), 250);
  }

  handleForward() {
    const v = this.videoRef?.nativeElement;
    if (!v) return;
    const step = this.prefs.seekStep();
    v.currentTime = Math.min(v.duration || v.currentTime + step, v.currentTime + step);
    this.forwardClicked.set(true);
    setTimeout(() => this.forwardClicked.set(false), 250);
  }

  handleTogglePlayPause() {
    const v = this.videoRef?.nativeElement;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  }

  // 拖放與檔案選擇（影片）
  triggerFileInput() {
    this.videoFileInput?.nativeElement?.click();
  }

  handleDragEnter(e: DragEvent) {
    e.preventDefault();
    this.dragCounter++;
    this.isDragging.set(true);
  }
  handleDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragCounter--;
    if (this.dragCounter === 0) this.isDragging.set(false);
  }
  handleDragOver(e: DragEvent) {
    e.preventDefault();
  }
  handleDrop(e: DragEvent) {
    e.preventDefault();
    this.dragCounter = 0;
    this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        this.handleVideoFile(file);
      } else {
        console.warn('請上傳影片檔案（MP4、WebM 或 OGG 格式）');
      }
    }
  }

  handleVideoFile(file: File) {
    if (!file.type.startsWith('video/')) {
      console.warn('不支援的檔案類型，請選擇影片檔案');
      return;
    }
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      console.warn('檔案太大，請選擇小於 2GB 的影片檔案');
      return;
    }
    const testVideo = document.createElement('video');
    const canPlay = testVideo.canPlayType(file.type);
    if (canPlay === '') {
      console.warn(`不支援的影片格式: ${file.type}。建議使用 MP4 (H.264) 格式`);
      return;
    }
    const url = URL.createObjectURL(file);
    this.src.set(url);
    this.videoId.set(file.name || 'local-video');
    this.videoFileName.set(file.name);
    this.videoFileSize.set(file.size);
    this.videoFileType.set(file.type);
    if (this.videoFileInput) this.videoFileInput.nativeElement.value = '';
  }

  // 字幕選擇/上傳
  triggerSubtitleInput() {
    this.subtitleFileInput?.nativeElement?.click();
  }

  onSubtitleSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedSubtitleFile.set(file);
    // 自動解析上傳
    if (file) this.uploadSubtitle();
  }

  async uploadSubtitle() {
    const file = this.selectedSubtitleFile();
    if (!file) return;
    this.isUploadingSubtitle.set(true);
    try {
      const lower = file.name.toLowerCase();
      if (!lower.endsWith('.srt') && !lower.endsWith('.json')) {
        throw new Error('請選擇 SRT 或 JSON 格式的字幕檔案');
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) throw new Error('字幕檔案太大，請選擇小於 10MB 的檔案');
      const text = await file.text();
      let parsed: SubtitleData[] = [];
      if (lower.endsWith('.srt')) parsed = parseSRT(text);
      else parsed = parseJSONSubtitles(text);
      this.subtitles.set(parsed);
      this.selectedSubtitleFile.set(null);
      if (this.subtitleFileInput) this.subtitleFileInput.nativeElement.value = '';
    } catch (err) {
      console.error('載入字幕失敗', err);
    } finally {
      this.isUploadingSubtitle.set(false);
    }
  }

  clearVideo() {
    this.src.set(null);
    this.videoId.set('');
    this.videoFileName.set('');
    this.videoFileSize.set(0);
    this.videoFileType.set('');
    this.subtitles.set([]);
    if (this.videoFileInput) this.videoFileInput.nativeElement.value = '';
    if (this.subtitleFileInput) this.subtitleFileInput.nativeElement.value = '';
  }

  clearSubtitles() {
    this.subtitles.set([]);
    this.selectedSubtitleFile.set(null);
    if (this.subtitleFileInput) this.subtitleFileInput.nativeElement.value = '';
  }

  formatFileSize(bytes: number) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
