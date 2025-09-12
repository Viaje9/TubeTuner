import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VideoLibraryService, type VideoMeta, type SubtitleMeta } from '../../services/video-library.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-video-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './video-detail.component.html',
})
export class VideoDetailComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lib: VideoLibraryService,
    private snack: MatSnackBar,
    private dialog: DialogService,
  ) {
    this.load();
  }

  id = '';
  meta = signal<VideoMeta | null>(null);
  name = signal('');
  nameError = signal('');
  subtitle = signal<SubtitleMeta | undefined>(undefined);
  isBusy = signal(false);

  async load() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (!this.id) {
      this.router.navigateByUrl('/video-list');
      return;
    }
    const meta = await this.lib.get(this.id);
    if (!meta) {
      this.snack.open('找不到影片', undefined, { duration: 3000 });
      this.router.navigateByUrl('/video-list');
      return;
    }
    this.meta.set(meta);
    this.name.set(meta.name);
    this.subtitle.set(await this.lib.getSubtitle(this.id));
  }

  async saveName() {
    const n = this.name().trim();
    this.nameError.set('');
    if (!n) return (this.nameError.set('名稱為必填'), undefined);
    if (n.length > 20) return (this.nameError.set('名稱不可超過 20 字'), undefined);
    try {
      await this.lib.rename(this.id, n);
      this.snack.open('已儲存', undefined, { duration: 2000 });
      await this.load();
    } catch (e: any) {
      this.snack.open(e?.message || '儲存失敗', undefined, { duration: 3000 });
    }
  }

  onSubtitleSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setSubtitle(file);
    input.value = '';
  }

  async setSubtitle(file: File) {
    try {
      await this.lib.setSubtitle(this.id, file);
      this.snack.open('字幕已更新', undefined, { duration: 2000 });
      this.subtitle.set(await this.lib.getSubtitle(this.id));
    } catch (e: any) {
      this.snack.open(e?.message || '字幕更新失敗', undefined, { duration: 3000 });
    }
  }

  async removeSubtitle() {
    try {
      await this.lib.removeSubtitle(this.id);
      this.snack.open('字幕已移除', undefined, { duration: 2000 });
      this.subtitle.set(undefined);
    } catch (e: any) {
      this.snack.open(e?.message || '移除失敗', undefined, { duration: 3000 });
    }
  }

  async removeVideo() {
    const ok = await this.dialog.confirm('確定要刪除這部影片？此操作無法復原', {
      title: '刪除確認',
      danger: true,
      confirmText: '刪除',
      cancelText: '取消',
    });
    if (!ok) return;
    try {
      await this.lib.remove(this.id);
      this.snack.open('已刪除', undefined, { duration: 3000 });
      this.router.navigateByUrl('/video-list');
    } catch (e: any) {
      this.snack.open(e?.message || '刪除失敗', undefined, { duration: 3000 });
    }
  }
}
