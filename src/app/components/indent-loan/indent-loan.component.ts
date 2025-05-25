import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { IndentLoanDialogComponent } from '../indent-loan/indent-loan-dialog/indent-loan-dialog.component';
import { ControllersService } from '../../services/controllers.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

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
    MatNativeDateModule
  ],
  templateUrl: './indent-loan.component.html'
})
export class IndentLoanComponent implements OnInit {
  indentLoans: any[] = [];
  
  constructor(
    private dialog: MatDialog,
    private toast: ToastrService,
    private controllerService: ControllersService
  ) {}

  ngOnInit() {
    this.loadIndentLoans();
  }

  loadIndentLoans() {
    this.controllerService.GetAllIndentLoans().subscribe((res:any) => {
      if(res){
        this.indentLoans = res;
      }else{
        this.toast.warning("Error found");
      }
    });
  }

  openNewIndentDialog() {
    const dialogRef = this.dialog.open(IndentLoanDialogComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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

  editIndentLoan(loan: any) {
    const dialogRef = this.dialog.open(IndentLoanDialogComponent, {
      width: '500px',
      data: loan
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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

  CreateNewLoan(loan:any){
    
  }
}