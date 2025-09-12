import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, type ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirm(message: string, options: Omit<ConfirmDialogData, 'message'> = {}): Promise<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message, ...options },
      panelClass: options.danger ? 'tt-dialog-danger' : undefined,
    });
    return ref.afterClosed().toPromise().then(v => !!v);
  }
}

