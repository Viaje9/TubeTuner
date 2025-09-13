import { Injectable, computed, signal } from '@angular/core';

export interface FavoriteItem {
  id: string; // video id or source id
  sentence: string;
  start: number;
  end: number;
  videoId?: string;
  createdAt: number;
}

const LS_KEY = 'tt-ng-favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly _items = signal<FavoriteItem[]>(this.load());
  readonly items = computed(() => this._items());

  private load(): FavoriteItem[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
    } catch {
      return [];
    }
  }

  private persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(this._items()));
  }

  add(item: Omit<FavoriteItem, 'createdAt'>) {
    const toAdd = { ...item, createdAt: Date.now() };
    this._items.update(list => [toAdd, ...list]);
    this.persist();
  }

  removeByIndex(idx: number) {
    this._items.update(list => list.filter((_, i) => i !== idx));
    this.persist();
  }

  clear() {
    this._items.set([]);
    this.persist();
  }
}

