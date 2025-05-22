import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    MatDialogModule
    // Add other necessary imports
  ],
  template: `
    <h2 mat-dialog-title>{{data ? 'Edit' : 'New'}} Indent Loan</h2>
    <form [formGroup]="indentForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="grid grid-cols-1 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Customer Name</mat-label>
            <input matInput formControlName="customerName" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Amount</mat-label>
            <input matInput type="number" formControlName="amount" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Agent</mat-label>
            <input matInput type="text" formControlName="agent" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Merchant Id</mat-label>
            <input matInput type="text" formControlName="merchantid" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Lender</mat-label>
            <input matInput type="text" formControlName="lender" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>City</mat-label>
            <input matInput type="text" formControlName="city">
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
export class IndentLoanDialogComponent {
  indentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<IndentLoanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.indentForm = this.fb.group({
      customerName: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      agent: ['', Validators.required],
      merchantid: ['', Validators.required],
      lender: ['', Validators.required],
      city: ['', Validators.required],
    });

    if (data) {
      this.indentForm.patchValue(data);
    }
  }

  onSubmit() {
    if (this.indentForm.valid) {
      this.dialogRef.close(this.indentForm.value);
    }
  }
}