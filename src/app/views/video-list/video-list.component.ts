import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { VideoLibraryService, type VideoMeta } from '../../services/video-library.service';
import { MenuIconComponent } from '../../components/icons/menu-icon.component';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MenuIconComponent],
  templateUrl: './video-list.component.html',
})
export class VideoListComponent {
  constructor(
    private lib: VideoLibraryService,
    private router: Router,
    private snack: MatSnackBar,
  ) {
    this.refresh();
  }

  items = signal<VideoMeta[]>([]);
  query = signal('');
  get list() {
    const q = this.query().toLowerCase();
    const all = this.items();
    if (!q) return all;
    return all.filter(v => (v.name_lc || v.name.toLowerCase()).includes(q));
  }

  async refresh() {
    this.items.set(await this.lib.list());
  }

  onFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length === 0) return;
    this.add(files);
    input.value = '';
  }

  async add(files: File[]) {
    try {
      await this.lib.addVideos(files);
      await this.refresh();
      this.snack.open('新增成功', undefined, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } catch (err: any) {
      this.snack.open(err?.message || '新增失敗', undefined, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  play(item: VideoMeta) {
    this.router.navigate(['/local-video'], { queryParams: { id: item.id } });
  }

  detail(item: VideoMeta) {
    this.router.navigate(['/video', item.id]);
  }
}
