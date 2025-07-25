import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomersComponent } from './components/customers/customers.component';
import { GoldLoansComponent } from './components/gold-loans/gold-loans.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './components/login/login.component';
import { SidenavComponent } from './shared/sidenav/sidenav.component';
import { PersonalloansComponent } from './components/personalloans/personalloans.component';
import { IndentLoanComponent } from './components/indent-loan/indent-loan.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'layout',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'gold-loans', component: GoldLoansComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'sidenav', component: SidenavComponent },
      { path: 'personalloans', component: PersonalloansComponent },
      { path: 'indent', component: IndentLoanComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
