import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidenavComponent } from '../../shared/sidenav/sidenav.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { GoldLoansComponent } from '../gold-loans/gold-loans.component';
import { SettingsComponent } from '../settings/settings.component';
import { PersonalloansComponent } from '../personalloans/personalloans.component';
import { IndentLoanComponent } from '../indent-loan/indent-loan.component';
import { LogoutConfirmDialog } from '../logout-confirm-dialog/logout-confirm-dialog.component';
import { SessionTimeoutDialog } from '../session-timeout-dialog/session-timeout-dialog.component';
import { AuthService } from '../../services/auth.service';
import { ControllersService } from '../../services/controllers.service';
import { MatDialog } from '@angular/material/dialog';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    HeaderComponent,
    SidenavComponent,
    DashboardComponent,
    GoldLoansComponent,
    SettingsComponent,
    PersonalloansComponent,
    IndentLoanComponent,
  ],
})
export class LayoutComponent implements OnInit, OnDestroy {
  isDashboard = false;
  isGoldLoans = false;
  isSettings = false;
  personalloans = false;
  indentloans = false;
  showSidenav = false;
  activeClass: string = '';
  currentUser: any;

  sessionTimeout: number = 10 * 60 * 1000; // 10 minutes in ms
  sessionTimer: any;
  lastActivityTime: number = Date.now();
  remainingTime: number = 10 * 60 * 1000;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private platformLocation: PlatformLocation,
    private controllers: ControllersService,
    private router: Router,
    private dialog: MatDialog
  ) {
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      this.openLogoutDialog();
    });
  }

  ngOnInit() {

    if(localStorage.getItem('currentUser') == null){
      this.router.navigate(['/login']);
    }

    this.currentUser = this.authService.currentUserValue;

    // Set screen based on role
    if (this.currentUser?.role === 'admin') {
      this.isDashboard = true;
      this.activeClass = 'dashboard';
      this.onScreenChange('dashboard');
    } else {
      this.isGoldLoans = true;
      this.activeClass = 'goldLoans';
      this.onScreenChange('goldLoans');
    }

    this.resetSessionTimer();
    this.startSessionTimer();
  }

  ngOnDestroy(): void {
    this.clearSessionTimer();
  }

  toggleSidenav() {
    this.showSidenav = !this.showSidenav;
    this.cdr.detectChanges();
  }

  onScreenChange(screen: string) {
    if (
      this.currentUser?.role !== 'admin' &&
      (screen === 'dashboard' || screen === 'settings')
    ) {
      console.warn('Access denied: Admin only');
      return;
    }

    this.activeClass = screen;
    this.resetScreens();

    switch (screen) {
      case 'dashboard':
        this.isDashboard = true;
        break;
      case 'goldLoans':
        this.isGoldLoans = true;
        break;
      case 'settings':
        this.isSettings = true;
        break;
      case 'personalLoans':
        this.personalloans = true;
        break;
      case 'indentloans':
        this.indentloans = true;
        break;
    }
  }

  private resetScreens() {
    this.isDashboard = false;
    this.isGoldLoans = false;
    this.isSettings = false;
    this.personalloans = false;
    this.indentloans = false;
  }

  async openLogoutDialog(): Promise<void> {
    if (this.dialog.openDialogs.length > 0) return;

    const dialogRef = this.dialog.open(LogoutConfirmDialog, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.controllers
          .LogoutAgent(this.currentUser, Number(this.currentUser.userId))
          .subscribe({
            next: () => {
              localStorage.removeItem('currentUser');
              this.authService.currentUserSubject.next(null);
              this.router.navigate(['/login']);
            },
            error: (err) => console.error('Logout error:', err),
          });
      }
    });
  }

  private startSessionTimer() {
    this.clearSessionTimer();
    this.sessionTimer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastActivityTime;
      const timeLeft = this.sessionTimeout - elapsed;

      this.remainingTime = Math.max(timeLeft, 0);

      if (elapsed >= this.sessionTimeout) {
        this.clearSessionTimer();
        this.openSessionTimeoutDialog();
      }
    }, 1000);
  }

  private resetSessionTimer() {
    this.lastActivityTime = Date.now();
    this.remainingTime = this.sessionTimeout;
  }

  private clearSessionTimer() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
  }

  private openSessionTimeoutDialog() {
    if (this.dialog.openDialogs.length > 0) return;

    const dialogRef = this.dialog.open(SessionTimeoutDialog, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'continue') {
        this.resetSessionTimer();
        this.startSessionTimer();
      } else {
        this.controllers
          .LogoutAgent(this.currentUser, Number(this.currentUser.userId))
          .subscribe({
            next: () => {
              localStorage.removeItem('currentUser');
              this.authService.currentUserSubject.next(null);
              this.router.navigate(['/login']);
            },
            error: (err) => console.error('Logout error:', err),
          });
      }
    });
  }

  // ✅ HostListener should point to a method, not a property!
  @HostListener('window:mousemove')
  @HostListener('window:keypress')
  @HostListener('window:click')
  onUserActivity() {
    this.resetSessionTimer();
  }

  @HostListener('window:beforeunload', ['$event'])
onBeforeUnload(event: any) {
  // Optional: prevent accidental tab close
  // event.preventDefault();
  // event.returnValue = '';

  this.handleBrowserCloseLogout();
}

private handleBrowserCloseLogout() {
  if (this.currentUser) {
    this.controllers
      .LogoutAgent(this.currentUser, Number(this.currentUser.userId))
      .subscribe({
        next: () => {
          localStorage.removeItem('currentUser');
          this.authService.currentUserSubject.next(null);
        },
        error: (err) => console.error('Logout error on browser close:', err),
      });
  }
}
}
