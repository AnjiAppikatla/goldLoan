import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ControllersService } from '../../services/controllers.service';

@Component({
  selector: 'app-session-timeout-dialog',
  template: `
    <h2 mat-dialog-title>Session Timeout</h2>
    <mat-dialog-content class="p-5">
      <p>Your session will expire in <span class="mx-2 text-red-500 font-medium">{{remainingTime}}</span> seconds.</p>
      <p>Would you like to continue your session?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="warn" (click)="onLogout()">Logout</button>
      <button mat-raised-button color="primary" (click)="onContinue()">Continue Session</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule]
})
export class SessionTimeoutDialog implements OnInit, OnDestroy {
  remainingTime: number = 60;
  private timer: any;

  constructor(
    public dialogRef: MatDialogRef<SessionTimeoutDialog>,
    private controllers: ControllersService,

  ) {}

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.clearTimer();
        this.dialogRef.close('logout');
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  onLogout(): void {
    this.clearTimer();
    this.dialogRef.close('logout');
  }

  onContinue(): void {
    const obj = {
      token: localStorage.getItem('token')
    }
    
    this.controllers.RefreshToken(obj).subscribe({
      next: (data) => {
        if (data) {
          localStorage.setItem('token', data.token);
          // this.clearTimer();
          this.dialogRef.close('continue');
        }
      }
    })
    // this.clearTimer();
    this.dialogRef.close('continue');
  }
}