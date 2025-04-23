import { Component, ChangeDetectorRef, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NewLoanComponent } from './new-loan/new-loan.component';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { GoldLoanService } from '../../services/gold-loan.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-gold-loans',
  standalone: true,
  imports: [CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatExpansionModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './gold-loans.component.html'
})
export class GoldLoansComponent {
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  commissionForm: FormGroup;
  selectedLoan: any;
  loans: any[] = [
    // {
    //   aadharNumber: "",
    //   amount:20000,
    //   branchId:"123",
    //   city:"Guntur - Kothapeta",
    //   commission:5,
    //   commissionAmount:"1000.00",
    //   createdAt:"2025-04-23T07:43:44.509Z",
    //   issuedDate:"2025-04-23T07:43:29.402Z",
    //   leadId:"13213212",
    //   lender:"Bajaj",
    //   loanProgress: 0,
    //   mobileNo :"1233444444",
    //   maturityDate :"Sat Jun 07 2025 23:59:59 GMT+0530 (India Standard Time)",
    //   merchantId :"147224577",
    //   name :"testing",
    //   panNumber:"",
    //   receivedCommissions: [],
    //   totalReceivedCommission: 0,
    //   receivableCommission: 0
    // }
    // Add more customer data here
  ];

  constructor(
    private dialog: MatDialog,
    private loanService: GoldLoanService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder

  ) {
    this.commissionForm = this.fb.group({
      commissionTotal: ['', Validators.required],
      received: ['', Validators.required],
      receivable: ['', Validators.required]
    });

    this.commissionForm.valueChanges.subscribe(() => {
      const total = this.commissionForm.get('commissionTotal')?.value || 0;
      const received = this.commissionForm.get('received')?.value || 0;
      this.commissionForm.patchValue({
        receivable: total - received
      }, { emitEvent: false });
    });
  }

  ngOnInit() {
    this.loans = this.loanService.getLoans();
    this.loans.map(x => {
      x.receivedCommissions.forEach((y:any) => {
        x.totalReceivedCommission += parseFloat(y.receivedCommission)
      })
    })
    // Pre-calculate progress for all loans
    this.loans = this.loans.map(loan => ({
      ...loan,
      progress: this.loanService.calculateProgress(loan)
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

  calculateProgress(loan: any): number {
    const today = new Date();
    const issuedDate = new Date(loan.issuedDate);
    const maturityDate = new Date(loan.maturityDate);

    const totalDays = (maturityDate.getTime() - issuedDate.getTime()) / (1000 * 3600 * 24);
    const daysElapsed = (today.getTime() - issuedDate.getTime()) / (1000 * 3600 * 24);

    let progress = (daysElapsed / totalDays) * 100;
    return Math.min(Math.max(progress, 0), 100); // Ensure progress is between 0 and 100
  }

  getProgressClass(progress: number): string {
    if (progress >= 90) {
      return 'bg-red-500';
    } else if (progress >= 75) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  }

  getProgressTextClass(progress: number): string {
    if (progress >= 90) {
      return 'text-red-500';
    } else if (progress >= 75) {
      return 'text-yellow-500';
    }
    return 'text-green-500';
  }


  commissionEnterClick(id: any) {
    this.loans.forEach((loan) => {
      if (loan.leadId === id) {
        const obj = Object.assign({});
        obj.receivedCommission = loan.leadId;
        loan.receivedCommissions
      }
    });
  }

  openEditDialog(loan: any) {
    this.selectedLoan = loan;
    this.commissionForm.patchValue({
      commissionTotal: loan.commissionAmount,
      received: loan.receivedAmount || 0,
      receivable: loan.commissionAmount - (loan.receivedAmount || 0)
    });

    const dialogRef = this.dialog.open(this.editDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the loan with new commission values
        this.selectedLoan.commissionAmount = result.commissionTotal;
        this.selectedLoan.receivedAmount = result.received;
        this.selectedLoan.receivableAmount = result.receivable;
        // Here you would typically call a service to update the backend
      }
      this.selectedLoan = null;
    });
  }

  // updateCommission() {
  //   if (this.commissionForm.valid) {
  //     const obj = Object.assign({});
  //     obj.commissions = []

  //     const obj2 = Object.assign({});
  //     obj2.receivedCommission = this.commissionForm.value.received;
  //     obj2.receivedCommissionDate = new Date().toISOString();

  //     obj.commissions.push(obj2)
   
  //     const formValue = this.commissionForm.value;
  //     this.loans.forEach((loan) => {
  //       if (loan.leadId === this.selectedLoan.leadId) {
  //         loan.receivedCommissions = obj;
  //         const receivedTotal = loan.receivedCommissions.map((c:any) => c.receivedCommission);
  //         loan.receivableCommission = this.commissionForm.controls['commissionTotal'].value - receivedTotal;
  //       }
  //     });
  //     console.log(formValue, this.loans);
  //     this.dialog.closeAll();
  //   }
  // }

  updateCommission() {
    if (this.commissionForm.valid) {
      this.loans = this.loans.map(loan => {
        if (loan.leadId === this.selectedLoan.leadId) {
          // Initialize receivedCommissions array if it doesn't exist
          if (!Array.isArray(loan.receivedCommissions)) {
            loan.receivedCommissions = [];
          }
          
          // Push new commission entry directly to the array
          loan.receivedCommissions.push({
            receivedCommission: this.commissionForm.value.received,
            receivedCommissionDate: new Date().toISOString()
          });
          
          // Calculate total received commissions
          const receivedTotal = loan.receivedCommissions.reduce((sum: number, commission: any) => 
            sum + (parseFloat(commission.receivedCommission) || 0), 0);
          
          // Update receivable commission
          loan.totalReceivedCommission = receivedTotal;
          loan.receivableCommission = parseFloat(this.commissionForm.controls['commissionTotal'].value) - receivedTotal;
          
          return loan;
        }
        return loan;
      });
  
      this.dialog.closeAll();
    }
  }







}
