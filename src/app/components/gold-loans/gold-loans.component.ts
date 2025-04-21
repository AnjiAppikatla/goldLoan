import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NewLoanComponent } from './new-loan/new-loan.component';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { GoldLoanService } from '../../services/gold-loan.service';

@Component({
  selector: 'app-gold-loans',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, MatExpansionModule],
  templateUrl: './gold-loans.component.html'
})
export class GoldLoansComponent {
  loans:any[] = [
    {
      leadId: '15100310',
      name: 'Aswini Degala',
      mobile: '7730087491',
      merchantId: '147224577',
      amount: 550950.00,
      branchId: '11750',
      city: 'Narasaraopet',
      payout70: 3085.32,
      payout30: 1322.28
    },
    // Add more customer data here
  ];

  constructor(private dialog: MatDialog, private loanService: GoldLoanService) {}

  ngOnInit() {
    this.loans = this.loanService.getLoans();
  }

  openNewLoanDialog() {
    this.dialog.open(NewLoanComponent, {
      width: '800px',
      disableClose: true
    });
  }
}
