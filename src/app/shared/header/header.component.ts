import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  notifications = [
    {
      id: 'L1001',
      type: 'New Loan',
      message: 'New gold loan application from John Smith',
      time: '2 hours ago'
    },
    {
      id: 'L1002',
      type: 'Payment Due',
      message: 'Payment due for loan ID L789',
      time: '5 hours ago'
    }
  ];

  adminUser = {
    name: 'Admin User',
    email: 'admin@tomasri.com',
    role: 'Administrator',
    branch: 'Main Branch'
  };

  constructor(private router: Router) {}

  logout() {
    // Add logout logic here
    this.router.navigate(['/login']);
  }
}
