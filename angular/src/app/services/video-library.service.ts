import { Injectable, NgZone } from '@angular/core';

export interface VideoMeta {
  id: string;
  name: string;
  mime: string;
  size: number;
  blobKey: string;
  createdAt: number;
  updatedAt: number;
  lastPlayedAt: number;
  lastPosition: number;
  lastModified?: number;
  // derived for search (not exposed outside DB ideally)
  name_lc?: string;
}

export type SubtitleKind = 'srt' | 'json';

export interface SubtitleMeta {
  videoId: string; // primary key (0..1 per video)
  blobKey: string;
  kind: SubtitleKind;
  name: string;
  size: number;
  createdAt: number;
}

type DBSchema = {
  videos: VideoMeta;
  videoBlobs: { blobKey: string; blob: Blob };
  subtitles: SubtitleMeta; // keyPath = videoId
  subtitleBlobs: { blobKey: string; blob: Blob };
};

@Injectable({ providedIn: 'root' })
export class VideoLibraryService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private readonly DB_NAME = 'tubetuner';
  private readonly DB_VERSION = 1;

  // throttle map for savePosition
  private pendingPositions = new Map<string, { pos: number; timer: number | null }>();

  constructor(private zone: NgZone) {
    // flush pending on unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushAllPositionsSync());
    }
  }

  // ---------- DB helpers ----------
  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        // videos
        if (!db.objectStoreNames.contains('videos')) {
          const store = db.createObjectStore('videos', { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('name_lc', 'name_lc');
        }
        // videoBlobs
        if (!db.objectStoreNames.contains('videoBlobs')) {
          db.createObjectStore('videoBlobs', { keyPath: 'blobKey' });
        }
        // subtitles
        if (!db.objectStoreNames.contains('subtitles')) {
          db.createObjectStore('subtitles', { keyPath: 'videoId' });
        }
        // subtitleBlobs
        if (!db.objectStoreNames.contains('subtitleBlobs')) {
          db.createObjectStore('subtitleBlobs', { keyPath: 'blobKey' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.dbPromise;
  }

  private tx<T extends keyof DBSchema>(stores: T[], mode: IDBTransactionMode) {
    return this.openDB().then(db => db.transaction(stores as string[], mode));
  }

  // ---------- Public API ----------

  async addVideos(files: File[]): Promise<VideoMeta[]> {
    if (!files || files.length === 0) return [];
    // basic validation and duplicate detection
    const normalized = files.map(f => ({
      file: f,
      dupeKey: `${(f.name || '').trim()}|${f.size}|${(f as any).lastModified ?? ''}`,
    }));

    // check batch-internal duplicates
    const seen = new Set<string>();
    for (const it of normalized) {
      if (seen.has(it.dupeKey)) {
        throw new Error(`重複的檔案：${it.file.name}`);
      }
      seen.add(it.dupeKey);
    }

    // validate types and sizes
    for (const { file } of normalized) {
      if (!file.type.startsWith('video/')) {
        throw new Error(`不支援的檔案類型：${file.name}`);
      }
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        throw new Error(`檔案太大無法上傳：${file.name}`);
      }
    }

    // check duplicates against DB
    const existing = await this.list();
    const existingKeys = new Set(
      existing.map(v => `${v.name}|${v.size}|${v.lastModified ?? ''}`),
    );
    for (const { file, dupeKey } of normalized) {
      if (existingKeys.has(dupeKey)) {
        throw new Error(`偵測到重複檔案：${file.name}`);
      }
    }

    // single transaction across involved stores
    const metas: VideoMeta[] = [];
    const tx = await this.tx(['videos', 'videoBlobs'], 'readwrite');
    const videos = tx.objectStore('videos');
    const blobs = tx.objectStore('videoBlobs');

    const now = Date.now();
    for (const { file } of normalized) {
      const id = crypto.randomUUID();
      const blobKey = crypto.randomUUID();
      const meta: VideoMeta = {
        id,
        name: (file.name || 'video').slice(0, 200),
        mime: file.type,
        size: file.size,
        blobKey,
        createdAt: now,
        updatedAt: now,
        lastPlayedAt: 0,
        lastPosition: 0,
        lastModified: (file as any).lastModified ?? undefined,
        name_lc: (file.name || 'video').toLowerCase(),
      };
      videos.add(meta);
      blobs.add({ blobKey, blob: file });
      metas.push(meta);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });

    return metas;
  }

  async list(): Promise<VideoMeta[]> {
    const tx = await this.tx(['videos'], 'readonly');
    const store = tx.objectStore('videos');
    const req = store.getAll();
    const items = await new Promise<VideoMeta[]>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    return (items || []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  async get(id: string): Promise<VideoMeta | undefined> {
    const tx = await this.tx(['videos'], 'readonly');
    const store = tx.objectStore('videos');
    const req = store.get(id);
    return new Promise<VideoMeta | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result ?? undefined);
      req.onerror = () => reject(req.error);
    });
  }

  async searchByName(q: string): Promise<VideoMeta[]> {
    const needle = (q || '').toLowerCase();
    if (!needle) return this.list();
    const all = await this.list();
    return all.filter(v => (v.name_lc || v.name.toLowerCase()).includes(needle));
  }

  async getVideoBlob(blobKey: string): Promise<Blob> {
    const tx = await this.tx(['videoBlobs'], 'readonly');
    const store = tx.objectStore('videoBlobs');
    const req = store.get(blobKey);
    const row = await new Promise<any>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (!row) throw new Error('影片內容不存在');
    return row.blob as Blob;
  }

  async getSubtitle(videoId: string): Promise<SubtitleMeta | undefined> {
    const tx = await this.tx(['subtitles'], 'readonly');
    const store = tx.objectStore('subtitles');
    const req = store.get(videoId);
    return new Promise<SubtitleMeta | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result ?? undefined);
      req.onerror = () => reject(req.error);
    });
  }

  async getSubtitleBlob(blobKey: string): Promise<Blob> {
    const tx = await this.tx(['subtitleBlobs'], 'readonly');
    const store = tx.objectStore('subtitleBlobs');
    const req = store.get(blobKey);
    const row = await new Promise<any>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (!row) throw new Error('字幕內容不存在');
    return row.blob as Blob;
  }

  async rename(id: string, name: string): Promise<void> {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('名稱為必填');
    if (trimmed.length > 20) throw new Error('名稱長度不可超過 20 個字');
    const tx = await this.tx(['videos'], 'readwrite');
    const store = tx.objectStore('videos');
    const current = await new Promise<VideoMeta | undefined>((resolve, reject) => {
      const r = store.get(id);
      r.onsuccess = () => resolve(r.result ?? undefined);
      r.onerror = () => reject(r.error);
    });
    if (!current) throw new Error('找不到影片');
    current.name = trimmed;
    current.name_lc = trimmed.toLowerCase();
    current.updatedAt = Date.now();
    store.put(current);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  savePosition(id: string, pos: number): Promise<void> {
    if (!id) return Promise.resolve();
    const entry = this.pendingPositions.get(id) || { pos: 0, timer: null };
    entry.pos = pos;
    this.pendingPositions.set(id, entry);
    if (entry.timer != null) return Promise.resolve();
    return new Promise<void>(resolve => {
      // throttle to every ~2s
      entry.timer = (setTimeout(async () => {
        entry.timer = null;
        try {
          const tx = await this.tx(['videos'], 'readwrite');
          const store = tx.objectStore('videos');
          const current = await new Promise<VideoMeta | undefined>((res, rej) => {
            const r = store.get(id);
            r.onsuccess = () => res(r.result ?? undefined);
            r.onerror = () => rej(r.error);
          });
          if (current) {
            current.lastPosition = entry.pos;
            current.lastPlayedAt = Date.now();
            store.put(current);
          }
          await new Promise<void>((res, rej) => {
            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
            tx.onabort = () => rej(tx.error);
          });
        } finally {
          resolve();
        }
      }, 2000) as unknown) as number;
    });
  }

  private flushAllPositionsSync() {
    const entries = Array.from(this.pendingPositions.entries());
    this.pendingPositions.clear();
    for (const [id, { pos, timer }] of entries) {
      if (timer != null) clearTimeout(timer);
      // fire-and-forget best effort
      const run = async () => {
        try {
          const tx = await this.tx(['videos'], 'readwrite');
          const store = tx.objectStore('videos');
          const current = await new Promise<VideoMeta | undefined>((res, rej) => {
            const r = store.get(id);
            r.onsuccess = () => res(r.result ?? undefined);
            r.onerror = () => rej(r.error);
          });
          if (current) {
            current.lastPosition = pos;
            current.lastPlayedAt = Date.now();
            store.put(current);
          }
        } catch {
          // ignore
        }
      };
      // ensure runs outside Angular to avoid timing issues on unload
      this.zone.runOutsideAngular(() => run());
    }
  }

  async setSubtitle(videoId: string, file: File): Promise<void> {
    const lower = file.name.toLowerCase();
    let kind: SubtitleKind | null = null;
    if (lower.endsWith('.srt')) kind = 'srt';
    else if (lower.endsWith('.json')) kind = 'json';
    if (!kind) throw new Error('只支援 SRT 或 JSON 字幕');
    const tx = await this.tx(['subtitles', 'subtitleBlobs'], 'readwrite');
    const subStore = tx.objectStore('subtitles');
    const blobStore = tx.objectStore('subtitleBlobs');
    // remove existing if any
    const existing = await new Promise<SubtitleMeta | undefined>((resolve, reject) => {
      const r = subStore.get(videoId);
      r.onsuccess = () => resolve(r.result ?? undefined);
      r.onerror = () => reject(r.error);
    });
    if (existing) {
      subStore.delete(videoId);
      blobStore.delete(existing.blobKey);
    }
    // insert
    const blobKey = crypto.randomUUID();
    const meta: SubtitleMeta = {
      videoId,
      blobKey,
      kind,
      name: file.name,
      size: file.size,
      createdAt: Date.now(),
    };
    subStore.put(meta);
    blobStore.put({ blobKey, blob: file });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async removeSubtitle(videoId: string): Promise<void> {
    const tx = await this.tx(['subtitles', 'subtitleBlobs'], 'readwrite');
    const subStore = tx.objectStore('subtitles');
    const blobStore = tx.objectStore('subtitleBlobs');
    const existing = await new Promise<SubtitleMeta | undefined>((resolve, reject) => {
      const r = subStore.get(videoId);
      r.onsuccess = () => resolve(r.result ?? undefined);
      r.onerror = () => reject(r.error);
    });
    if (existing) {
      subStore.delete(videoId);
      blobStore.delete(existing.blobKey);
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async remove(id: string): Promise<void> {
    const tx = await this.tx(['videos', 'videoBlobs', 'subtitles', 'subtitleBlobs'], 'readwrite');
    const videos = tx.objectStore('videos');
    const vBlobs = tx.objectStore('videoBlobs');
    const subs = tx.objectStore('subtitles');
    const sBlobs = tx.objectStore('subtitleBlobs');

    const meta = await new Promise<VideoMeta | undefined>((resolve, reject) => {
      const r = videos.get(id);
      r.onsuccess = () => resolve(r.result ?? undefined);
      r.onerror = () => reject(r.error);
    });
    if (meta) {
      videos.delete(id);
      vBlobs.delete(meta.blobKey);
    }
    const sub = await new Promise<SubtitleMeta | undefined>((resolve, reject) => {
      const r = subs.get(id);
      r.onsuccess = () => resolve(r.result ?? undefined);
      r.onerror = () => reject(r.error);
    });
    if (sub) {
      subs.delete(id);
      sBlobs.delete(sub.blobKey);
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
}

