import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  danger?: boolean;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="p-4 min-w-[260px]">
      <h2 class="text-lg font-semibold text-white mb-2">{{ data.title || '確認' }}</h2>
      <p class="text-gray-300 mb-4">{{ data.message }}</p>
      <div class="flex justify-end gap-2">
        <button (click)="close(false)" class="px-3 py-1.5 rounded bg-gray-600 text-white">
          {{ data.cancelText || '取消' }}
        </button>
        <button
          (click)="close(true)"
          class="px-3 py-1.5 rounded text-white"
          [class.bg-red-600]="data.danger"
          [class.bg-blue-600]="!data.danger"
        >
          {{ data.confirmText || '確認' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private ref: MatDialogRef<ConfirmDialogComponent, boolean>,
  ) {}

  close(result: boolean) {
    this.ref.close(result);
  }
}

