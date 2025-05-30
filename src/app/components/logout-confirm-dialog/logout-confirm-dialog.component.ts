import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-confirm-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Logout</h2>
    <mat-dialog-content>
      Are you sure you want to logout?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button (click)="onNoClick()">No</button>
      <button mat-raised-button color="warn" (click)="onYesClick()">Yes</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class LogoutConfirmDialog {
  constructor(public dialogRef: MatDialogRef<LogoutConfirmDialog>) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}