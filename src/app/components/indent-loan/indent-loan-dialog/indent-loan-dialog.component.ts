import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { GoldLoanService } from '../../../services/gold-loan.service';
import { AuthService } from '../../../services/auth.service';
import { ControllersService } from '../../../services/controllers.service';

@Component({
  selector: 'app-indent-loan-dialog',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,    
    FormsModule,
    MatDatepickerModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{data ? 'Edit' : 'New'}} Indent Loan</h2>
    <form [formGroup]="indentForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="grid grid-cols-1 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Customer Name</mat-label>
            <input matInput formControlName="name" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Amount</mat-label>
            <input matInput type="number" formControlName="amount" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Agent</mat-label>
            <mat-select formControlName="agent" required>
              <mat-option *ngFor="let agent of agents" [value]="agent.name">
                {{agent.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Merchant</mat-label>
            <mat-select formControlName="merchantid" required>
              <mat-option *ngFor="let merchant of merchants" [value]="merchant.merchantid">
                {{merchant.merchantName}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Lender</mat-label>
            <mat-select formControlName="lender" required>
              <mat-option *ngFor="let lender of lenders" [value]="lender.lenderName">
                {{lender.lenderName}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>City</mat-label>
            <mat-select formControlName="city" required>
              <mat-option *ngFor="let city of cities" [value]="city.name">
                {{city.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date" required>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!indentForm.valid">
          {{data ? 'Update' : 'Save'}}
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class IndentLoanDialogComponent implements OnInit {
  indentForm: FormGroup;
  agents: any[] = [];
  merchants: any[] = [];
  lenders: any[] = [];
  cities: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<IndentLoanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ControllersService: ControllersService,
    private authService: AuthService
  ) {
    this.indentForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      agent: ['', Validators.required],
      merchantid: ['', Validators.required],
      lender: ['', Validators.required],
      city: ['', Validators.required],
    });
  }

  ngOnInit() {

    this.GetAllAgents();
    this.GetAllMerchants();
    this.GetAllLenders();
    this.GetAllCities();

    console.log(this.agents);
    console.log(this.merchants);
    console.log(this.lenders);
    console.log(this.cities);

    // If editing, patch form with existing data
    if (this.data) {
      this.indentForm.patchValue({
        name: this.data.name,
        amount: this.data.amount,
        date: new Date(this.data.created_at),
        agent: this.data.agent,
        merchantid: this.data.merchantid,
        lender: this.data.lender,
        city: this.data.city
      });
    }
  }

  GetAllAgents(){
    this.ControllersService.GetAllAgents().subscribe((res:any) => {
      if(res){
        this.agents = res;
      }else{
        this.agents = [];
      }
    });
  }

  GetAllMerchants(){
    this.ControllersService.GetAllMerchants().subscribe((res:any) => {
      if(res){
        this.merchants = res;
      }else{
        this.merchants = [];
      }
    });
  }

  GetAllLenders(){
    this.ControllersService.GetAllLenders().subscribe((res:any) => {
      if(res){
        this.lenders = res;
      }else{
        this.lenders = [];
      }
    })
  }

  GetAllCities(){
    this.ControllersService.GetAllBranches().subscribe((res:any) => {
      if(res){
        this.cities = res;
      }else{
        this.cities = [];
      }
    })
  }

  onSubmit() {
    if (this.indentForm.valid) {
      this.dialogRef.close(this.indentForm.value);
    }
  }
}