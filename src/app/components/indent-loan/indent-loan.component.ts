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
    // this.indentLoans = [
    //   {
    //     id: 1,
    //     customerName: 'John Doe',
    //     amount: 50000,
    //     date: new Date(),
    //     status: 'Pending',
    //     agent: 'Agent 1',
    //     merchantid: '1231213'
    //   }
    // ];

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
        // Add the new indent loan to the list
        // this.indentLoans.push({
        //   id: this.indentLoans.length + 1,
        //   ...result,
        //   status: 'Pending'
        // });

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
        // Update the loan in the list
        const index = this.indentLoans.findIndex(l => l.id === loan.id);
        if (index !== -1) {
          this.indentLoans[index] = { ...loan, ...result };
        }
      }
    });
  }

  deleteIndentLoan(id: number) {
    // TODO: Implement delete logic
  }

  CreateNewLoan(loan:any){
    
  }
}