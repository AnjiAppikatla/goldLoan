import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AddressService } from '../../../services/address.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { CustomerService } from '../../../services/customer.service';
import { GoldLoanService } from '../../../services/gold-loan.service';

@Component({
  selector: 'app-new-loan',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [AddressService],
  templateUrl: './new-loan.component.html'
})
export class NewLoanComponent implements OnInit {
  loanForm!: FormGroup;
  filteredAddresses$!: Observable<string[]>;
 

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewLoanComponent>,
    private addressService: AddressService,
    private goldLoanService: GoldLoanService
  ) {
    this.initForm();
  }

  private initForm() {
    this.loanForm = this.fb.group({
      leadId: ['', Validators.required],
      customerName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      goldWeight: ['', [Validators.required, Validators.min(0)]],
      loanAmount: ['', [Validators.required, Validators.min(0)]],
      agentName: ['', Validators.required],
      aadharNumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
    //   panCard: ['', [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      panCard: ['', [Validators.required]],
      currentAddress: ['', Validators.required],
      sameAddress: [false],
      permanentAddress: ['']
    });
  }

  ngOnInit() {
    this.initAddressAutocomplete();
  }

  private initAddressAutocomplete() {
    this.filteredAddresses$ = this.loanForm.get('currentAddress')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.addressService.searchAddress(value || ''))
    );
  }

//   private _filter(value: string): string[] {
//     const filterValue = value.toLowerCase();
//     return this.addresses.filter(address => address.toLowerCase().includes(filterValue));
//   }

  onAddressSearch(event: any) {
    const value = event.target.value;
    if (value.length > 2) {
      this.filteredAddresses$ = this.addressService.searchAddress(value);
    }
  }

  onSameAddressChange(event: any) {
    if (event.checked) {
      this.loanForm.patchValue({
        permanentAddress: this.loanForm.get('currentAddress')?.value
      });
    }
  }

  onSubmit() {
    if (this.loanForm.valid) {
      this.dialogRef.close(this.loanForm.value);
      this.goldLoanService.loans.push(this.loanForm.value);
    }
  }
}

