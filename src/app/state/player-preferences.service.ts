import { Injectable, signal } from '@angular/core';

interface PlayerPrefsData {
  playbackRate: number;
  seekStep: number; // seconds
}

const STORAGE_KEY = 'tt-player-prefs';

@Injectable({ providedIn: 'root' })
export class PlayerPreferencesService {
  playbackRate = signal<number>(1);
  seekStep = signal<number>(10);

  constructor() {
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: Partial<PlayerPrefsData> = JSON.parse(raw);
        if (typeof data.playbackRate === 'number') this.playbackRate.set(this.clampRate(data.playbackRate));
        if (typeof data.seekStep === 'number') this.seekStep.set(this.clampStep(data.seekStep));
      }
    } catch {
      // ignore
    }
  }

  save() {
    const data: PlayerPrefsData = {
      playbackRate: this.clampRate(this.playbackRate()),
      seekStep: this.clampStep(this.seekStep()),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  update(partial: Partial<PlayerPrefsData>) {
    if (partial.playbackRate !== undefined) this.playbackRate.set(this.clampRate(partial.playbackRate));
    if (partial.seekStep !== undefined) this.seekStep.set(this.clampStep(partial.seekStep));
    this.save();
  }

  private clampRate(rate: number) { return Math.min(4, Math.max(0.25, Number(rate) || 1)); }
  private clampStep(step: number) { return Math.min(60, Math.max(1, Math.round(Number(step) || 10))); }
}
