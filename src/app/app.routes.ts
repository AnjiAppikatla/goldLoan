import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomersComponent } from './components/customers/customers.component';
import { GoldLoansComponent } from './components/gold-loans/gold-loans.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './components/login/login.component';
import { SidenavComponent } from './shared/sidenav/sidenav.component';
import { PersonalloansComponent } from './components/personalloans/personalloans.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'gold-loans', component: GoldLoansComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'sidenav', component: SidenavComponent },
      { path: 'layout', component: LayoutComponent },
      { path: 'personalloans', component: PersonalloansComponent },
      

    ]
  }
];
