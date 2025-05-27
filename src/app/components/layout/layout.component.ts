import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidenavComponent } from '../../shared/sidenav/sidenav.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { CustomersComponent } from '../customers/customers.component';
import { GoldLoansComponent } from '../gold-loans/gold-loans.component';
import { SettingsComponent } from '../settings/settings.component';
import { PersonalloansComponent } from '../personalloans/personalloans.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { IndentLoanComponent } from "../indent-loan/indent-loan.component";


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  standalone: true,
  styleUrls: ['./layout.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    HeaderComponent,
    SidenavComponent,
    DashboardComponent,
    // CustomersComponent,
    GoldLoansComponent,
    SettingsComponent,
    PersonalloansComponent,
    IndentLoanComponent
]
})
export class LayoutComponent {
  isDashboard = false;
  isGoldLoans = false;
  isSettings = false;
  personalloans = false;
  indentloans = false;


  showSidenav = false;
  currentUser: any;
  activeClass: string = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;    
    
    // Set initial screen based on user role
    if (this.currentUser?.role === "admin") {
      this.isDashboard = true;
      this.activeClass = 'dashboard';
      this.onScreenChange('dashboard');
    } else {
      this.isGoldLoans = true;
      this.activeClass = 'goldLoans';
      this.onScreenChange('goldLoans');
    }
}

toggleSidenav() {
  this.showSidenav = !this.showSidenav;
  // if (this.showSidenav) {
  //   this.activeClass = this.currentUser?.role === 'admin' ? 'dashboard' : 'goldLoans';
  // }
  this.cdr.detectChanges();
}

onScreenChange(screen: string) {
  // Strict role-based access control
  if (this.currentUser?.role !== 'admin' && (screen === 'dashboard' || screen === 'settings')) {
    console.log('Access denied: Admin only screen');
    return;
  }

  this.activeClass = screen;
  this.resetScreens();

  switch(screen) {
    case 'dashboard':
      if (this.currentUser?.role === 'admin') {
        this.isDashboard = true;
      }
      break;
    case 'goldLoans':
      this.isGoldLoans = true;
      break;
    case 'settings':
      if (this.currentUser?.role === 'admin') {
        this.isSettings = true;
      }
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
}