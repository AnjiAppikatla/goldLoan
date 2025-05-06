import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { GoldLoanService } from '../../services/gold-loan.service';
import { AuthService } from '../../services/auth.service';
import { ControllersService } from '../../services/controllers.service';

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
    MatDividerModule,
    RouterModule
  ]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  notifications: any[] = [];
  loans: any = [];
  adminUser: any = null;

  constructor(
    private router: Router,
    private goldLoanService: GoldLoanService,
    private authService: AuthService,
    private controllers: ControllersService
  ) {}

  ngOnInit() {
    // Get loans and handle empty case
    this.GetAllLoans();
    
    // Only process notifications if we have loans
    if (this.loans.length > 0) {
      // Sort loans by date to get latest
      const latestLoan = this.loans.sort((a:any, b:any) => 
        new Date(b.IssuedDate || '').getTime() - new Date(a.IssuedDate || '').getTime()
      )[0];

      // Sort loans by maturity date to get nearest expiry
      const nearestExpiryLoan = this.loans.sort((a:any, b:any) => 
        new Date(a.MaturityDate || '').getTime() - new Date(b.MaturityDate || '').getTime()
      )[0];

      if (latestLoan && nearestExpiryLoan) {
        this.notifications = [
          {
            customerName: latestLoan.Name || 'Unknown Customer',
            status: 'New Loan Added',
            maturityDate: latestLoan.IssuedDate,
            type: 'new'
          },
          {
            customerName: nearestExpiryLoan.CustomerName || 'Unknown Customer',
            status: 'Loan Expiring Soon',
            maturityDate: nearestExpiryLoan.MaturityDate,
            type: 'expiry'
          }
        ];
      }
    }

    // Subscribe to user changes
    this.authService.currentUser.subscribe(user => {
      this.adminUser = user;
    });
  }

  GetAllLoans() {
    this.loans = [];
    this.controllers.GetAllLoans().subscribe({
      next: (response) => {
        if (response) {
          this.loans = response;
          this.loans.map((loan: any) => {
            const {progress, status} = this.goldLoanService.calculateProgress(loan);
            loan.progress = progress;
            loan.status = status;
          })
        }
      },
      error: (error) => {
        console.error('Error fetching loans:', error);
      }
    });
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
