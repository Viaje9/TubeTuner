import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VideoLibraryService, type VideoMeta, type SubtitleMeta } from '../services/video-library.service';

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

  async resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<ResolvedVideoData | null> {
    const id = route.queryParamMap.get('id') || route.paramMap.get('id') || '';
    if (!id) return this.missing();
    const meta = await this.lib.get(id);
    if (!meta) return this.missing();
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
      return this.missing();
    }
  }

  private missing(): null {
    this.snack.open('找不到影片資料', undefined, { duration: 3000 });
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
