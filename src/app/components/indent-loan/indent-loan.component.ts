import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { IndentLoanDialogComponent } from '../indent-loan/indent-loan-dialog/indent-loan-dialog.component';
import { ControllersService } from '../../services/controllers.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { NewLoanComponent } from '../gold-loans/new-loan/new-loan.component';
import { AuthService } from '../../services/auth.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { take } from 'rxjs';

@Component({
  selector: 'app-indent-loan',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule
  ],
  templateUrl: './indent-loan.component.html'
})
export class IndentLoanComponent implements OnInit {
  indentLoans: any[] = [];
  filteredIndentLoans: any[] = [];
  currentUser: any;
  isApproved = new FormControl(false);
  @ViewChild('Approval') Approval!: TemplateRef<any>;
  @ViewChild('Account_add') Account_add!: TemplateRef<any>;
  @ViewChild('Transfer') Transfer!: TemplateRef<any>;

  constructor(
    private dialog: MatDialog,
    private toast: ToastrService,
    private controllerService: ControllersService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit() {
    this.loadIndentLoans();
  }

  loadIndentLoans() {
    this.controllerService.GetAllIndentLoans().subscribe((res:any) => {
      if(res){
        this.indentLoans = res;
        this.filterIndentLoans();
      }else{
        this.toast.warning("Error found");
      }
    });
  }

  filterIndentLoans() {
    if (this.currentUser?.role === 'admin') {
      // Group loans by agent for admin view
      const groupedLoans = this.indentLoans.reduce((acc, loan) => {
        const agent = loan.agent || 'Unassigned';
        if (!acc[agent]) {
          acc[agent] = [];
        }
        acc[agent].push(loan);
        return acc;
      }, {});
      
      this.filteredIndentLoans = Object.entries(groupedLoans).map(([agent, loans]) => ({
        agent,
        loans
      }));
    } else {
      // Filter loans for specific agent
      this.filteredIndentLoans = [{
        agent: this.currentUser.name,
        loans: this.indentLoans.filter(loan => loan.agent === this.currentUser.name)
      }];
    }
  }

  openNewIndentDialog() {
    const dialogRef = this.dialog.open(IndentLoanDialogComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.indentloan_status = "Pending";
        result.account_status = "Pending";
        result.transfer_status = "Pending";
        this.controllerService.CreateIndentLoan(result).subscribe((res:any) => {
          if(res){
            this.toast.success("Indent loan created successfully");
            this.loadIndentLoans();
          }
        });
      }
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  ApprovalClick(event: any, loan: any) {
    if (event.checked) {
      this.dialog.open(this.Approval, {
        width: '400px',
        disableClose: true
      });

      this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => {
        loan.indentloan_status = 'Approved';
        // loan.date = loan.created_at; // Set date to current dat
        this.controllerService.UpdateIndentLoan(loan, Number(loan.id)).subscribe((res:any) => {
          if(res){
            this.toast.success('Loan approved successfully');
            this.loadIndentLoans();
          }
        });
      });
    }
  }

  AccounAddClick(event: any, loan: any) {
    if (event.checked) {
      this.dialog.open(this.Approval, {
        width: '400px',
        disableClose: true
      });

      this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => {
        loan.account_status = 'Added';
        // loan.date = loan.created_at; // Set date to current dat
        this.controllerService.UpdateIndentLoan(loan, Number(loan.id)).subscribe((res:any) => {
          if(res){
            this.toast.success('Account Added successfully');
            this.loadIndentLoans();
          }
        });
      });
    }
  }

  TransferClick(event: any, loan: any) {
    if (event.checked) {
      this.dialog.open(this.Approval, {
        width: '400px',
        disableClose: true
      });

      this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => {
        loan.transfer_status = 'Transferred';
        // loan.date = loan.created_at; // Set date to current dat
        this.controllerService.UpdateIndentLoan(loan, Number(loan.id)).subscribe((res:any) => {
          if(res){
            this.toast.success('Transferred successfully');
            this.loadIndentLoans();
          }
        });
      });
    }
  }

  updateAgent(){
    this.dialog.closeAll();
  }

  close(){
    this.dialog.closeAll()
  }

  editIndentLoan(loan: any) {
    const dialogRef = this.dialog.open(IndentLoanDialogComponent, {
      width: '500px',
      data: loan
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.indentloan_status = "Pending";
        this.controllerService.UpdateIndentLoan(result, Number(loan.id)).subscribe((res:any) => {
          if(res){
            this.toast.success("Indent loan updated successfully");
            this.loadIndentLoans();
          }
        });
      }
    });
  }

  deleteIndentLoan(id: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this loan?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.controllerService.DeleteIndentLoan(Number(id)).subscribe({
          next: (response) => {
            if (response) {
              this.toast.success("Indent loan deleted successfully");
              this.loadIndentLoans(); // Refresh the list
            }
          }
        });
      }
    });
  }

  CreateNewLoan(loan: any) {
      const dialogRef = this.dialog.open(NewLoanComponent, {
          width: '90%',
          maxWidth: '1200px',
          data: {
              isEdit: false,
              indentLoan: loan
          }
      });
  
      dialogRef.afterClosed().subscribe(result => {
          if (result) {
              // Update indent loan status
              const updatedLoan = { ...loan, indentloan_status: 'Completed', date: loan.created_at };
              this.controllerService.UpdateIndentLoan(updatedLoan, Number(loan.id)).subscribe((res: any) => {
                  if (res) {
                      this.toast.success("Loan created and indent status updated successfully");
                      this.loadIndentLoans();
                  }
              });
          }
      });
  }
}