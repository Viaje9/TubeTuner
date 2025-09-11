import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { PlayerPreferencesService } from '../../state/player-preferences.service';

@Component({
  selector: 'app-play-settings-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './play-settings-dialog.component.html',
})
export class PlayerSettingsDialogComponent {
  readonly dialogRef = inject<MatDialogRef<PlayerSettingsDialogComponent>>(MatDialogRef, { optional: true });
  readonly sheetRef = inject<MatBottomSheetRef<PlayerSettingsDialogComponent>>(MatBottomSheetRef, { optional: true });
  readonly prefs = inject(PlayerPreferencesService);

  playbackRate = this.prefs.playbackRate();
  // allow blank input: keep as string model
  seekStepInput: string = String(this.prefs.seekStep());
  speedPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4];

  private applyRate(rate: number) {
    const clamped = Math.min(4, Math.max(0.25, Number(rate) || 1));
    this.playbackRate = clamped;
    this.prefs.update({ playbackRate: clamped });
  }

  private clampSeekStep(step: number) {
    return Math.min(60, Math.max(1, Math.round(step)));
  }

  onRateInput() {
    this.applyRate(this.playbackRate);
  }

  setSpeed(v: number) {
    this.applyRate(v);
  }

  decreaseSpeed() {
    const idx = this.speedPresets.findIndex((s) => Math.abs(s - this.playbackRate) < 0.01);
    if (idx > 0) this.applyRate(this.speedPresets[idx - 1]);
    else this.applyRate(Math.max(0.25, this.playbackRate - 0.25));
  }

  increaseSpeed() {
    const idx = this.speedPresets.findIndex((s) => Math.abs(s - this.playbackRate) < 0.01);
    if (idx >= 0 && idx < this.speedPresets.length - 1) this.applyRate(this.speedPresets[idx + 1]);
    else this.applyRate(Math.min(4, this.playbackRate + 0.25));
  }

  isPresetActive(p: number) {
    return Math.abs(this.playbackRate - p) < 0.01;
  }

  save() {
    // playbackRate already persisted via live updates
    // handle seekStep: allow blank => default
    let step = parseInt(String(this.seekStepInput), 10);
    if (Number.isNaN(step)) step = 10; // default
    step = this.clampSeekStep(step);
    this.prefs.update({ seekStep: step });
    const data = { playbackRate: this.playbackRate, seekStep: step };
    if (this.sheetRef) this.sheetRef.dismiss(data); else this.dialogRef?.close(data);
  }

  close() {
    if (this.sheetRef) this.sheetRef.dismiss(null); else this.dialogRef?.close(null);
  }
}
