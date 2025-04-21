import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
      payout30: 1322.28,
       issuedDate: '2024-01-01',
    maturityDate: '2024-07-01'
    },
    // Add more customer data here
  ];

  constructor(private dialog: MatDialog, private loanService: GoldLoanService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // this.loans = this.loanService.getLoans();
    this.loans = this.loans.map(loan => ({
      ...loan,
      progress: this.calculateProgress(loan)
    }));
    this.cdr.detectChanges();
  }

  openNewLoanDialog() {
    const dialogWidth = window.innerWidth <= 768 ? '96vw' : '800px';
    this.dialog.open(NewLoanComponent, {
      width: dialogWidth,
      maxWidth: '100vw',
      height: '85h',
      disableClose: true,
      autoFocus: true,
      restoreFocus: true,
      ariaDescribedBy: 'new-loan-dialog-description',
      role: 'dialog',
      panelClass: ['full-width-dialog']
    });
  }

  calculateProgress(loan: any): { progress: number; status: string } {
    if (!loan.issuedDate || !loan.maturityDate) {
      return { progress: 0, status: 'safe' };
    }

    const today = new Date();
    const issuedDate = new Date(loan.issuedDate);
    const maturityDate = new Date(loan.maturityDate);
    
    const totalDays = maturityDate.getTime() - issuedDate.getTime();
    const daysLeft = maturityDate.getTime() - today.getTime();
    const progress = Math.min(Math.max(((totalDays - daysLeft) / totalDays) * 100, 0), 100);

    let status = 'safe';
    if (progress >= 90) status = 'danger';
    else if (progress >= 75) status = 'warning';

    return { progress: Math.round(progress * 100) / 100, status };
  }





}
