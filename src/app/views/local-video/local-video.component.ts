import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AiChatComponent } from '../../components/ai-chat/ai-chat.component';
import { CloudUploadIconComponent } from '../../components/icons/cloud-upload-icon.component';
import { DocumentIconComponent } from '../../components/icons/document-icon.component';
import { ForwardIconComponent } from '../../components/icons/forward-icon.component';
import { MenuIconComponent } from '../../components/icons/menu-icon.component';
import { PauseIconComponent } from '../../components/icons/pause-icon.component';
import { PlayIconComponent } from '../../components/icons/play-icon.component';
import { RewindIconComponent } from '../../components/icons/rewind-icon.component';
import { SettingsIconComponent } from '../../components/icons/settings-icon.component';
import { StarSolidIconComponent } from '../../components/icons/star-solid-icon.component';
import { PlayerSettingsDialogComponent } from '../../components/play-settings-dialog/play-settings-dialog.component';
import { SubtitleScrollComponent } from '../../components/subtitle-scroll/subtitle-scroll.component';
import type { ResolvedVideoData } from '../../resolvers/video.resolver';
import { VideoLibraryService } from '../../services/video-library.service';
import { AppStateService } from '../../state/app-state.service';
import { FavoritesService } from '../../state/favorites.service';
import { PlayerPreferencesService } from '../../state/player-preferences.service';
import { parseJSONSubtitles, toEventsJSON } from '../../utils/json-subtitle-parser';
import { getCurrentSubtitle, parseSRT, type SubtitleData } from '../../utils/srt-parser';

@Component({
  selector: 'app-local-video',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SubtitleScrollComponent,
    MatBottomSheetModule,
    AiChatComponent,
    // icons
    MenuIconComponent,
    SettingsIconComponent,
    StarSolidIconComponent,
    CloudUploadIconComponent,
    DocumentIconComponent,
    RewindIconComponent,
    PlayIconComponent,
    PauseIconComponent,
    ForwardIconComponent,
  ],
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
  // 視圖切換：同頁切換影片/AI 對話
  showChat = signal(false);

  private _snackBar = inject(MatSnackBar);
  constructor(
    private bottomSheet: MatBottomSheet,
    public prefs: PlayerPreferencesService,
    private fav: FavoritesService,
    private app: AppStateService,
    private lib: VideoLibraryService,
    private route: ActivatedRoute,
  ) {
    const data = this.route.snapshot.data['video'] as ResolvedVideoData | null;
    if (data) {
      this.src.set(data.videoUrl);
      this.videoId.set(data.meta.id);
      if (data.subtitle) {
        try {
          const txt = data.subtitle.text;
          const kind = data.subtitle.meta.kind;

          this.subtitles.set(kind === 'json' ? parseJSONSubtitles(txt) : parseSRT(txt));
        } catch (e) {
          console.warn('解析字幕失敗', e);
        }
      }
      this.rate.set(this.prefs.playbackRate());
    }
  }
  get hasVideoLoaded() {
    return !!this.src();
  }
  get hasSubtitles() {
    return this.subtitles().length > 0;
  }
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
    if (v) {
      this.currentTime.set(v.currentTime);
      const id = this.videoId();
      if (id) this.lib.savePosition(id, v.currentTime);
    }
  }

  onPlay() {
    this.isPlaying.set(true);
  }
  onPause() {
    this.isPlaying.set(false);
  }
  onLoadedMetadata() {
    this.isReady.set(true);
    const v = this.videoRef?.nativeElement;
    if (v) {
      v.playbackRate = this.prefs.playbackRate();
      const data = this.route.snapshot.data['video'] as ResolvedVideoData | null;
      // 僅在路由解析的影片與當前影片一致時，才套用上次播放位置
      if (data && data.meta.id === this.videoId() && data.meta.lastPosition > 0 && v.duration) {
        try {
          const pos = Math.min(data.meta.lastPosition, v.duration - 0.5);
          if (pos > 0) v.currentTime = pos;
        } catch {}
      }
    }
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
        try {
          parsed = parseJSONSubtitles(text);
        } catch {
          parsed = parseSRT(text);
        }
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

  openSettings() {
    const ref = this.bottomSheet.open(PlayerSettingsDialogComponent, {
      panelClass: 'tt-bottom-sheet',
    });
    ref.afterDismissed().subscribe(result => {
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
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
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
    if (v.paused) v.play();
    else v.pause();
  }

  // 拖放與檔案選擇（影片）
  triggerFileInput() {
    this.videoFileInput?.nativeElement?.click();
  }

  async handleVideoFile(file: File) {
    try {
      const metas = await this.lib.addVideos([file]);
      const created = metas[0];
      if (!created) throw new Error('新增失敗');
      // 不導頁，直接在同頁載入新影片
      const blob = await this.lib.getVideoBlob(created.blobKey);
      const url = URL.createObjectURL(blob);
      this.src.set(url);
      this.videoId.set(created.id);
      this.subtitles.set([]);
      this.isReady.set(false);
    } catch (e: any) {
      this._snackBar.open(e?.message || '無法新增影片', undefined, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } finally {
      if (this.videoFileInput) this.videoFileInput.nativeElement.value = '';
    }
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
      const id = this.videoId();
      if (!id) throw new Error('請先選擇或載入影片');
      let fileToSave = file;
      let textToParse: string | null = null;

      if (lower.endsWith('.json')) {
        const raw = await file.text();
        // 若為 content 格式，轉為 events 格式後再儲存
        try {
          const { json, converted } = toEventsJSON(raw);
          textToParse = json;
          if (converted) {
            fileToSave = new File([json], file.name, { type: 'application/json' });
          }
        } catch {
          // 若轉換失敗，仍嘗試以既有 events 解析；失敗會拋錯
          textToParse = raw;
        }
      }

      await this.lib.setSubtitle(id, fileToSave);

      if (lower.endsWith('.json')) {
        this.subtitles.set(parseJSONSubtitles(textToParse || (await fileToSave.text())));
      } else {
        const text = await fileToSave.text();
        this.subtitles.set(parseSRT(text));
      }
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

  // 以當前收藏作為上下文，開啟 AI 對話
  openChatWithSelected() {
    const items = this.fav.items();
    // 即使無收藏，也切換到 AI 對話
    const lines = (items.length > 0 ? items : [])
      .map((it, i) => `${i + 1}. ${it.sentence}`)
      .join('<br>');
    // 僅第一次帶入收藏字幕作為 system 上下文
    if (lines) {
      const marker = '以下為使用者所選取的句子：';
      const alreadyHasContext = this.app
        .messages()
        .some(m => m.role === 'system' && m.content.includes(marker));
      if (!alreadyHasContext) {
        const system = {
          role: 'system' as const,
          content: `${marker}<br><br>${lines}<br><br>請基於這些內容協助回答後續問題。`,
        };
        console.log('注入系統上下文', system);

        this.app.setPendingContext([system]);
      }
    }

    // const msg = [
    //   {
    //     role: 'system',
    //     content:
    //       '以下為使用者所選取的句子：<br><br>1. They do not like anything that is different or strange, and they hate mysterious things most of all.<br>2. They are a perfectly normal family.<br>3. Mr. and Mrs. Dursley live at number 4, Privet Drive.<br><br>請基於這些內容協助回答後續問題。',
    //     id: 'e96d9f8b3ff84a85-90ddee6b-45e9184-8bd32ed-7fee6296f6d5a9ec77a56fa',
    //     createdAt: 1757736917082,
    //   },
    //   {
    //     role: 'user',
    //     content: '詳細翻譯',
    //     id: 'e9bfc5b872639b9d-30ae8d8-4e0b786-92dffc6-c6c1bfbbb478d28527f28b29',
    //     createdAt: 1757736920641,
    //   },
    //   {
    //     role: 'assistant',
    //     content:
    //       '以下是這三句的詳細翻譯：\n\n1.  **They do not like anything that is different or strange, and they hate mysterious things most of all.**\n    *   **詳細翻譯：** 他們不喜歡任何異於常規或怪異的事物，而他們最厭惡的莫過於神秘事物。\n    *   **說明：**\n        *   "anything that is different or strange" 翻譯為「任何異於常規或怪異的事物」，「異於常規」比「不同」更強調不尋常，「怪異」則準確表達"strange"。\n        *   "they hate mysterious things most of all" 翻譯為「他們最厭惡的莫過於神秘事物」，「厭惡」比「討厭」語氣更重，更符合"hate"的程度。「莫過於」則精準表達了「最......不過」或「沒有什麼比這更......」的意思，強調了「最」的程度。\n\n2.  **They are a perfectly normal family.**\n    *   **詳細翻譯：** 他們是一個再正常不過的家庭。\n    *   **說明：**\n        *   "perfectly normal" 翻譯為「再正常不過」，這是一個非常地道且有力的表達方式，強調了「完全、絕對正常」的語氣，比單純的「非常正常」或「完全正常」更具原文的強調意味。\n\n3.  **Mr. and Mrs. Dursley live at number 4, Privet Drive.**\n    *   **詳細翻譯：** 德思禮夫婦住在水蠟樹街四號。\n    *   **說明：**\n        *   "Mr. and Mrs. Dursley" 翻譯為「德思禮夫婦」，這是指稱夫妻的常用且簡潔的方式。\n        *   "Privet Drive" 是《哈利波特》系列中的地名，標準譯名為「水蠟樹街」。\n        *   地址的順序在中文中通常是街名在前，門牌號碼在後，因此「水蠟樹街四號」是自然流暢的表達。',
    //     id: '80499f75468d8ac4-ea84fab-4f5b848-92e9162-3465e880224c3498842adcf8',
    //     createdAt: 1757736930087,
    //   },
    // ];

    // msg.forEach(e => {
    //   this.app.addMessage({ role: e.role as 'system' | 'user' | 'assistant', content: e.content });
    // });

    this.showChat.set(true);
  }

  openChat() {
    this.showChat.set(true);
  }
  closeChat() {
    this.showChat.set(false);
  }
}
