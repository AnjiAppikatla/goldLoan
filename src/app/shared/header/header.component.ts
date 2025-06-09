import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  notifications: any[] = [];
  loans: any[] = [];
  indentLoans: any[] = [];
  adminUser: any = null;

  constructor(
    private router: Router,
    private goldLoanService: GoldLoanService,
    private authService: AuthService,
    private controllers: ControllersService
  ) {}

  ngOnInit() {
    // Get loans and indent loans
    this.GetAllLoans();
    this.GetAllIndentLoans();

    // Subscribe to user changes
    this.adminUser = this.authService.currentUserValue;

    // Process notifications after data is loaded
    setTimeout(() => {
      this.processNotifications();
    }, 2000);
  }

  GetAllLoans() {
    this.loans = [];
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // e.g., 6 for June
    const currentYear = today.getFullYear();  // e.g., 2025
    this.controllers.GetLoansByMonth(currentMonth,currentYear).subscribe({
    // this.controllers.GetAllLoans().subscribe({
      next: (response) => {
        if (response) {
          this.loans = response;
          this.loans.map((loan: any) => {
            const {progress, status} = this.goldLoanService.calculateProgress(loan);
            loan.progress = progress;
            loan.status = status;
          });
        }
      },
      error: (error) => {
        console.error('Error fetching loans:', error);
      }
    });
  }

  GetAllIndentLoans() {
    this.indentLoans = [];
    this.controllers.GetAllIndentLoans().subscribe({
      next: (response) => {
        if (response) {
          this.indentLoans = response;
        }
      },
      error: (error) => {
        console.error('Error fetching indent loans:', error);
      }
    });
  }

  processNotifications() {
    this.notifications = [];

    // Process regular loans
    if (this.loans.length > 0) {
      const latestLoan = this.loans.sort((a: any, b: any) => 
        new Date(b.IssuedDate || '').getTime() - new Date(a.IssuedDate || '').getTime()
      )[0];

      if (latestLoan) {
        this.notifications.push({
          customerName: latestLoan.Name || 'Unknown Customer',
          agentName: latestLoan.AgentName || 'Unknown Agent',
          status: 'New Gold Loan Added',
          maturityDate: latestLoan.IssuedDate,
          type: 'new'
        });
      }
    }

    // Process indent loans
    if (this.indentLoans.length > 0) {
      const latestIndentLoan = this.indentLoans.sort((a: any, b: any) => 
        new Date(b.IssuedDate || '').getTime() - new Date(a.IssuedDate || '').getTime()
      )[0];

      if (latestIndentLoan) {
        this.notifications.push({
          customerName: latestIndentLoan.name || 'Unknown Customer',
          agentName: latestIndentLoan.agent || 'Unknown Agent',
          status: 'New Indent Loan Added',
          maturityDate: latestIndentLoan.created_at,
          type: 'indent'
        });
      }
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
