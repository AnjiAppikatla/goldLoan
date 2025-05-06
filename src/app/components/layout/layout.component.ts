import { Component } from '@angular/core';
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


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
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
    // CustomersComponent,
    GoldLoansComponent,
    SettingsComponent,
    PersonalloansComponent,
  ]
})
export class LayoutComponent {
  isDashboard = false;  // Changed to false by default
  isCustomers = false;
  isGoldLoans = true;   // Changed to true by default
  isSettings = false;
  personalloans = false;

  showSidenav = false;
  currentUser: any;

  // private subscription: Subscription;

  constructor(private authService: AuthService) {
    // this.currentUser = this.authService.currentUserValue;
    // // console.log(this.currentUser);
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
  }

  toggleSidenav() {
    this.showSidenav = !this.showSidenav;
  }

  onScreenChange(screen: string) {
    // Check if user has access to the screen
    if ((screen === 'dashboard' || screen === 'settings') && this.currentUser?.role !== 'admin') {
      return; // Don't change screen if user is not admin
    }

    this.resetScreens();
    switch(screen) {
      case 'dashboard':
        this.isDashboard = true;
        break;
      case 'customers':
        this.isCustomers = true;
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
    }
  }

  private resetScreens() {
    this.isDashboard = false;
    this.isCustomers = false;
    this.isGoldLoans = false;
    this.isSettings = false;
    this.personalloans = false;
  }


}