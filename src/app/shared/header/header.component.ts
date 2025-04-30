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

  adminUser:any = []

  constructor(
    private router: Router,
    private goldLoanService: GoldLoanService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get latest loan and nearest expiry loan
    const allLoans = this.goldLoanService.getLoans();

    this.adminUser = this.authService.currentUserValue;

    // console.log(this.adminUser);

    
    // Sort loans by date to get latest
    const latestLoan = allLoans.sort((a, b) => 
      new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
    )[0];

    // Sort loans by maturity date to get nearest expiry
    const nearestExpiryLoan = allLoans.sort((a, b) => 
      new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()
    )[0];

    this.notifications = [
      {
        customerName: latestLoan.customerName,
        status: 'New Loan Added',
        maturityDate: latestLoan.issuedDate,
        type: 'new'
      },
      {
        customerName: nearestExpiryLoan.customerName,
        status: 'Loan Expiring Soon',
        maturityDate: nearestExpiryLoan.maturityDate,
        type: 'expiry'
      }
    ];
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
