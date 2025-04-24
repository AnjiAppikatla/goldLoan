import { Component, ChangeDetectorRef, OnInit, ViewChild, TemplateRef, viewChild, ElementRef } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from '../../services/toastr.service';

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
  @ViewChild('receiveCommission') receiveCommission!: ElementRef;
  loans: any[] = [];

  constructor(
    private dialog: MatDialog,
    private loanService: GoldLoanService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private toast: ToastService

  ) {
    this.commissionForm = this.fb.group({
      commissionTotal: ['', Validators.required],
      received: ['', Validators.required],
      receivable: ['', Validators.required]
    });

    // Add subscription to form value changes
    this.commissionForm.valueChanges.subscribe(() => {
      const total = parseFloat(this.commissionForm.get('commissionTotal')?.value) || 0;
      const received = parseFloat(this.commissionForm.get('received')?.value) || 0;
      
      // Calculate receivable amount
      const receivable = total - received;
      
      // Update the receivable control without triggering another valueChanges event
      this.commissionForm.patchValue({
        receivable: receivable.toFixed(2)
      }, { emitEvent: false });
    });
  }

  ngOnInit() {
    // Get loans from service
    this.loans = this.loanService.getLoans() || [];
    
    // Initialize and calculate progress for each loan
    this.loans = this.loans.map(loan => {
      if (!loan) return null; // Skip if loan is undefined
      
      // Calculate progress - ensure it has a default value
      const progress = this.loanService.calculateProgress(loan) || { progress: 0, status: 'safe' };
      
      // Initialize totalReceivedCommission if not exists
      const totalReceivedCommission = typeof loan.totalReceivedCommission === 'number' 
        ? loan.totalReceivedCommission 
        : 0;
  
      // Calculate total received commission
      const calculatedReceivedCommission = Array.isArray(loan.receivedCommissions)
        ? loan.receivedCommissions.reduce((total: number, commission: any) => {
            return total + (parseFloat(commission.receivedCommission) || 0);
          }, 0)
        : 0;
  
      // Return loan with guaranteed progress property
      return {
        ...loan,
        progress: progress, // Ensure progress object exists
        totalReceivedCommission: calculatedReceivedCommission,
        receivableCommission: parseFloat(loan.commissionAmount || 0) - calculatedReceivedCommission
      };
    }).filter(loan => loan !== null); // Remove any null entries
  
    this.cdr.detectChanges();
  }

  openNewLoanDialog() {
    const dialogWidth = window.innerWidth <= 768 ? '96vw' : '800px';
    const dialogRef = this.dialog.open(NewLoanComponent, {
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
  
    // Subscribe to dialog close event
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload loans data
        this.loans = this.loanService.getLoans();
        
        // Show success message
       this.toast.success('Loan created successfully');

        // Update progress for the newly created loan
        const newLoan = this.loans.find(loan => loan.leadId === result.leadId);
        
        // Ensure progress is calculated for all loans
        this.loans = this.loans.map(loan => {
          // Calculate progress with default value
          const progress = this.loanService.calculateProgress(loan) || { progress: 0, status: 'safe' };
          
          const totalReceivedCommission = typeof loan.totalReceivedCommission === 'number' 
            ? loan.totalReceivedCommission 
            : 0;
    
          const calculatedReceivedCommission = Array.isArray(loan.receivedCommissions)
            ? loan.receivedCommissions.reduce((total: number, commission: any) => {
                return total + (parseFloat(commission.receivedCommission) || 0);
              }, 0)
            : 0;
    
          return {
            ...loan,
            progress: progress,
            totalReceivedCommission: calculatedReceivedCommission,
            receivableCommission: parseFloat(loan.commissionAmount || 0) - calculatedReceivedCommission
          };
        });
    
        this.cdr.detectChanges();
      }
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
  
    // Reverse the status logic - start with green and transition to red
    let status = 'safe';
    if (progress >= 75) {
      status = 'warning';
    }
    if (progress >= 90) {
      status = 'danger';
    }
  
    return { 
      progress: Math.round(progress * 100) / 100, 
      status: status 
    };
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
    this.selectedLoan = { ...loan };
    
    // Calculate total received commission from the array
    const totalReceived = Array.isArray(loan.receivedCommissions) 
      ? loan.receivedCommissions.reduce((sum: number, commission: any) => 
          sum + (parseFloat(commission.receivedCommission) || 0), 0)
      : loan.totalReceivedCommission || 0;
  
    // Initialize form with latest values
    this.commissionForm.patchValue({
      commissionTotal: parseFloat(loan.commissionAmount || 0),
      received: totalReceived, // Show current received amount instead of 0
      receivable: parseFloat(loan.commissionAmount || 0) - totalReceived
    });
  
    const dialogRef = this.dialog.open(this.editDialog, {
      width: '400px',
      id: 'editDialog',
      data: this.selectedLoan,
      disableClose: false // Allow clicking outside to close
    });

    dialogRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        if (this.receiveCommission?.nativeElement) {
          this.receiveCommission.nativeElement.focus();
        }
      }, 100);
    });
  }
  
  updateCommission() {
    if (this.commissionForm.valid) {
      try {
        const newCommission = parseFloat(this.commissionForm.value.received);
        const totalCommission = parseFloat(this.selectedLoan.commissionAmount);
  
        // Validate commission amount
        if (newCommission > totalCommission) {
          this.toast.warning(`Commission cannot exceed total amount of ${totalCommission}`)
          return;
        }
  
        // Update commission in service
        this.loanService.updateCommission(this.selectedLoan.leadId, {
          received: newCommission
        });
  
        // Update local data with progress calculation
        this.loans = this.loans.map(loan => {
          if (loan.leadId === this.selectedLoan.leadId) {
            // Calculate progress
            const progress = this.loanService.calculateProgress(loan);
            
            return {
              ...loan,
              progress: progress,
              totalReceivedCommission: newCommission,
              receivableCommission: totalCommission - newCommission
            };
          }
          // Preserve existing loan data including progress
          return {
            ...loan,
            progress: loan.progress // Keep existing progress
          };
        });
  
        // Close only the dialog, not the expansion panel
        const dialogRef = this.dialog.getDialogById('editDialog');
        if (dialogRef) {
          dialogRef.close();
        }
        
        // Show success message
        this.toast.success('Commission updated successfully');
        
        // Force change detection to update the view
        this.cdr.detectChanges();
      } catch (error: any) {
        this.toast.error(error.message);
      }
    }
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

  // updateCommission() {
  //   if (this.commissionForm.valid) {
  //     this.loans = this.loans.map(loan => {
  //       if (loan.leadId === this.selectedLoan.leadId) {
  //         // Initialize receivedCommissions array if it doesn't exist
  //         if (!Array.isArray(loan.receivedCommissions)) {
  //           loan.receivedCommissions = [];
  //         }
          
  //         // Push new commission entry directly to the array
  //         loan.receivedCommissions.push({
  //           receivedCommission: this.commissionForm.value.received,
  //           receivedCommissionDate: new Date().toISOString()
  //         });
          
  //         // Calculate total received commissions
  //         const receivedTotal = loan.receivedCommissions.reduce((sum: number, commission: any) => 
  //           sum + (parseFloat(commission.receivedCommission) || 0), 0);
          
  //         // Update receivable commission
  //         loan.totalReceivedCommission = receivedTotal;
  //         loan.receivableCommission = parseFloat(this.commissionForm.controls['commissionTotal'].value) - receivedTotal;
          
  //         return loan;
  //       }
  //       return loan;
  //     });
  
  //     // Update the service
  //     this.loanService.loans = this.loans;
      
  //     // Close dialog but maintain accordion state
  //     this.dialog.closeAll();
      
  //     // Force change detection to update view
  //     this.cdr.detectChanges();
  //   }
  // }







}
