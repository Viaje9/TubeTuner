import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  VideoLibraryService,
  type VideoMeta,
  type SubtitleMeta,
} from '../services/video-library.service';

export interface ResolvedVideoData {
  meta: VideoMeta;
  videoUrl: string; // object URL
  subtitle?: { meta: SubtitleMeta; text: string };
}

@Injectable({ providedIn: 'root' })
export class VideoResolverImpl {
  constructor(
    private lib: VideoLibraryService,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Promise<ResolvedVideoData | null> {
    const id = route.queryParamMap.get('id') || route.paramMap.get('id') || '';

    // 若帶有 id，優先以指定影片載入；失敗則改為回退到「最近播放」影片
    if (id) {
      const meta = await this.lib.get(id);
      if (meta) {
        try {
          const blob = await this.lib.getVideoBlob(meta.blobKey);
          const videoUrl = URL.createObjectURL(blob);
          const subMeta = await this.lib.getSubtitle(meta.id);
          let subtitle: ResolvedVideoData['subtitle'] | undefined;
          if (subMeta) {
            const sblob = await this.lib.getSubtitleBlob(subMeta.blobKey);
            const text = await sblob.text();
            subtitle = { meta: subMeta, text };
          }
          return { meta, videoUrl, subtitle };
        } catch (e) {
          console.error(e);
          // 繼續嘗試回退邏輯
        }
      }
    }

    // 沒有 id 或載入指定影片失敗時：
    // 1) 若有資料，挑選「最近播放」(lastPlayedAt) 優先，其次以建立時間排序
    // 2) 若完全沒有資料，返回 null 以讓頁面顯示上傳區，不再導向清單頁
    const all = await this.lib.list();
    if (!all || all.length === 0) {
      return null;
    }
    const pick = [...all].sort(
      (a, b) =>
        (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0) || (b.createdAt || 0) - (a.createdAt || 0),
    )[0];
    try {
      const blob = await this.lib.getVideoBlob(pick.blobKey);
      const videoUrl = URL.createObjectURL(blob);
      const subMeta = await this.lib.getSubtitle(pick.id);
      let subtitle: ResolvedVideoData['subtitle'] | undefined;
      if (subMeta) {
        const sblob = await this.lib.getSubtitleBlob(subMeta.blobKey);
        const text = await sblob.text();
        subtitle = { meta: subMeta, text };
      }
      return { meta: pick, videoUrl, subtitle };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private missing(): null {
    this.snack.open('找不到影片資料', undefined, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
    this.router.navigateByUrl('/video-list');
    return null;
  }
}

export const VideoResolver: ResolveFn<ResolvedVideoData | null> = (route, state) => {
  const impl = new VideoResolverImpl(
    inject(VideoLibraryService),
    inject(Router),
    inject(MatSnackBar),
  );
  return impl.resolve(route, state);
};
