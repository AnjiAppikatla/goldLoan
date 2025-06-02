import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { authenticationGuard } from './shared/gaurds/authentication.guard';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  // {
  //   path: 'layout',
  //   loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
  //   canActivate: [authenticationGuard] // ✅ Secure this route
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }