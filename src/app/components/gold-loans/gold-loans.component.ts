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
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    FormsModule,
  ],
  templateUrl: './gold-loans.component.html'
})
export class GoldLoansComponent {

  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  @ViewChild('filterdialog') filterDialog!: TemplateRef<any>;
  commissionForm: FormGroup;
  selectedLoan: any;
  @ViewChild('receiveCommission') receiveCommission!: ElementRef;
  loans: any[] = [];
  selectedStatus: string = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  filteredLoans: any[] = [];

  // Add new properties for filtering
  selectedAgent: string = '';
  selectedDateFilter: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  uniqueAgents: any[] = [];
  currentUser: any;
  // filteredLoans: any[] = [];

  constructor(
    private dialog: MatDialog,
    private loanService: GoldLoanService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private toast: ToastService,
    private authService: AuthService

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
    this.currentUser = this.authService.currentUserValue;
    // Get loans from service
    this.loans = this.loanService.getLoans() || [];

    // Initialize filtered loans
    this.filteredLoans = [...this.loans];

    this.uniqueAgents = [...new Set(this.authService.users.map(loan => loan.name))].filter(agent => agent);

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

        // Only get unique agents list for admin
        if (this.currentUser?.role === 'admin') {
          this.uniqueAgents = [...new Set(this.authService.users
            .filter(user => user.role === 'agent')
            .map(agent => agent.name))]
            .filter(agent => agent);
        }

            // Calculate progress for each loan
    this.filteredLoans = this.filteredLoans.map(loan => ({
      ...loan,
      progress: this.loanService.calculateProgress(loan) || { progress: 0, status: 'safe' }
    }));

    this.cdr.detectChanges();
  }



  // Update your applyFilters method to include the new filters
  applyFilters(): void {
    let filtered = [...this.loans];

    // Filter by agent
    if (this.selectedAgent) {
      filtered = filtered.filter(loan => loan.agentname === this.selectedAgent);
    }

    // Filter by date
    if (this.selectedDateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      switch (this.selectedDateFilter) {
        case 'today':
          filtered = filtered.filter(loan => {
            const loanDate = new Date(loan.issuedDate);
            loanDate.setHours(0, 0, 0, 0);
            return loanDate.getTime() === today.getTime();
          });
          break;

        case 'yesterday':
          filtered = filtered.filter(loan => {
            const loanDate = new Date(loan.issuedDate);
            loanDate.setHours(0, 0, 0, 0);
            return loanDate.getTime() === yesterday.getTime();
          });
          break;

        case 'thisWeek':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          filtered = filtered.filter(loan => {
            const loanDate = new Date(loan.issuedDate);
            return loanDate >= startOfWeek && loanDate <= today;
          });
          break;

        case 'thisMonth':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered.filter(loan => {
            const loanDate = new Date(loan.issuedDate);
            return loanDate >= startOfMonth && loanDate <= today;
          });
          break;

        case 'custom':
          if (this.fromDate && this.toDate) {
            const toDateEnd = new Date(this.toDate);
            toDateEnd.setHours(23, 59, 59, 999);
            filtered = filtered.filter(loan => {
              const loanDate = new Date(loan.issuedDate);
              return loanDate >= this.fromDate! && loanDate <= toDateEnd;
            });
          }
          break;
      }
    }

    this.filteredLoans = filtered;
    const dialogRef = this.dialog.getDialogById('filterDialog');
    if (dialogRef) {
      dialogRef.close();
    }
  }

  // Add this method to reset all filters
  resetFilters(): void {
    this.selectedAgent = '';
    this.selectedDateFilter = '';
    this.fromDate = null;
    this.toDate = null;
    this.filteredLoans = [...this.loans];
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
  
        // Initialize progress for new loans
        this.loans = this.loans.map(loan => {
          if (!loan) return null;
  
          // Calculate progress
          const progress = this.loanService.calculateProgress(loan) || { progress: 0, status: 'safe' };
  
          // Initialize commission values
          const totalReceivedCommission = Array.isArray(loan.receivedCommissions)
            ? loan.receivedCommissions.reduce((total: number, commission: any) => {
              return total + (parseFloat(commission.receivedCommission) || 0);
            }, 0)
            : 0;
  
          return {
            ...loan,
            progress: progress,
            totalReceivedCommission: totalReceivedCommission,
            receivableCommission: parseFloat(loan.commissionAmount || 0) - totalReceivedCommission,
            // Initialize other required properties
            receivedCommissions: loan.receivedCommissions || []
          };
        }).filter(loan => loan !== null);
  
        // Update filtered loans as well
        this.filteredLoans = [...this.loans];
        
        // Update unique agents list
        this.uniqueAgents = [...new Set(this.loans.map(loan => loan.agentname))].filter(agent => agent);
  
        // Show success message
        this.toast.success('Loan created successfully');
  
        // Force change detection
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

  filterDialong() {
    this.dialog.open(this.filterDialog, {
      width: '400px',
      id: 'filterDialog'
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







}
