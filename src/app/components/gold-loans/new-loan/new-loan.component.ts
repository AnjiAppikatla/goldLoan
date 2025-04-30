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
import { DatePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ToastService } from '../../../services/toastr.service';
import { AuthService } from '../../../services/auth.service';

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
    HttpClientModule,
    MatDatepickerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [AddressService],
  templateUrl: './new-loan.component.html'
})
export class NewLoanComponent implements OnInit {
  loanForm!: FormGroup;
  filteredCities!: Observable<any[]>;

  commissionPercentages: number[] = [5, 7, 9, 11, 13, 15];
  paymentTypes: string[] = ['Cash', 'Online', 'Both'];
  onlinePaymentTypes: string[] = ['UPI', 'Phone pay', 'GooglePay', 'Bank Transfer'];
  receivedByList: string[] = ['Manikanta - savings', 'Revathi - savings','Manikanta - current', 'Revathi - current'];

  lenders: any[] = [
    {lenderName: 'Bajaj', id: 1, percentage: 0.006},
    {lenderName: 'HDFC', id: 2, percentage: 0.006},
    {lenderName: 'ICICI', id: 3, percentage: 0.006},
    {lenderName: 'SBI', id: 4, percentage: 0.006}
  ];
  merchants: any[] = [
    {merchantName: 'Mani', merchantid: '147224577'},
    {merchantName: 'Revathi', merchantid: '147224578'},
    {merchantName: 'Tomasri', merchantid: '147224579'},
    {merchantName: 'Kanta', merchantid: '147224580'}
  ];
  cities: any[] = []

  Agents: any = []
  currentUser: any;


  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewLoanComponent>,
    private goldLoanService: GoldLoanService,
    private toast: ToastService,
    private authService: AuthService
  ) {
    this.initForm();
  }
  ngOnInit() {
    this.initCityAutocomplete();
    this.loanForm.controls['issuedDate'].setValue(new Date().toISOString());
    this.calculateMaturityDate();

    this.cities = this.goldLoanService.cities;
    // Subscribe to payment type changes
    this.loanForm.get('paymentType')?.valueChanges.subscribe(paymentType => {
      const cashAmountControl = this.loanForm.get('cashAmount');
      const onlineAmountControl = this.loanForm.get('onlineAmount');
      const onlinePaymentTypeControl = this.loanForm.get('onlinePaymentType');

      if (paymentType === 'Cash') {
        cashAmountControl?.setValidators([Validators.required, Validators.min(0)]);
        onlineAmountControl?.clearValidators();
        onlinePaymentTypeControl?.clearValidators();
      } else if (paymentType === 'Online') {
        onlineAmountControl?.setValidators([Validators.required, Validators.min(0)]);
        onlinePaymentTypeControl?.setValidators([Validators.required]);
        cashAmountControl?.clearValidators();
      } else if (paymentType === 'Both') {
        cashAmountControl?.setValidators([Validators.required, Validators.min(0)]);
        onlineAmountControl?.setValidators([Validators.required, Validators.min(0)]);
        onlinePaymentTypeControl?.setValidators([Validators.required]);
      }

      cashAmountControl?.updateValueAndValidity();
      onlineAmountControl?.updateValueAndValidity();
      onlinePaymentTypeControl?.updateValueAndValidity();

      const amount = this.loanForm.get('amount')?.value;
      if (amount) {
        this.updatePaymentAmounts(amount, paymentType);
      }
    });

   this.Agents = this.authService.users;

   this.currentUser = this.authService.currentUserValue;
    
   // If user is an agent, pre-select and disable agent selection
   if (this.currentUser?.role === 'agent') {
    this.loanForm.patchValue({
      agentname: this.currentUser.name,
      agentId: this.currentUser.id  // Set the agent ID from current user
    });
    this.loanForm.get('agentname')?.disable();
    this.loanForm.get('agentId')?.disable();
  }
   
   // Only load agent list for admin
   if (this.currentUser?.role === 'admin') {
    this.Agents = this.authService.users.filter(user => user.role === 'agent');
    // For admin, enable selecting agent and their ID
    this.loanForm.get('agentname')?.valueChanges.subscribe(agentName => {
      const selectedAgent = this.Agents.find((agent:any) => agent.name === agentName);
      if (selectedAgent) {
        this.loanForm.patchValue({
          agentId: selectedAgent.id
        });
      }
    });
  }
  }

  private calculateCommissionAmount() {
    const amount = parseFloat(this.loanForm.get('amount')?.value) || 0;
    const commissionPercentage = parseFloat(this.loanForm.get('commission')?.value) || 0;
    
    if (amount && commissionPercentage) {
      const commissionAmount = (amount * commissionPercentage) / 100;
      this.loanForm.patchValue({
        commissionAmount: commissionAmount.toFixed(2)
      }, { emitEvent: false });
    } else {
      this.loanForm.patchValue({
        commissionAmount: 0
      }, { emitEvent: false });
    }
  }

  private updatePaymentAmounts(totalAmount: number, paymentType: string) {
    switch(paymentType) {
      case 'Cash':
        this.loanForm.patchValue({
          cashAmount: totalAmount,
          onlineAmount: 0
        }, { emitEvent: false });
        break;
      case 'Online':
        this.loanForm.patchValue({
          cashAmount: 0,
          onlineAmount: totalAmount
        }, { emitEvent: false });
        break;
      case 'Both':
        // Don't auto-fill amounts for 'Both' type
        // Let user input cash amount and calculate online amount accordingly
        break;
    }
  }

  private initForm() {
    this.loanForm = this.fb.group({
      lender: ['Bajaj', Validators.required],
      leadId: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      name: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      merchantId: [this.merchants[0].merchantid, Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      commission: [0.006, Validators.required], // Set default commission
      commissionAmount: [''],
      branchId: ['', [Validators.required]],
      city: ['', Validators.required],
      panNumber: [''], // Optional
      aadharNumber: [''], // Optional
      issuedDate: [new Date().toISOString(), Validators.required],
      maturityDate: ['', Validators.required],
      loanProgress: [0],
      paymentType: ['Cash', Validators.required], // Set default payment type
      cashAmount: [0],
      onlineAmount: [0],
      onlinePaymentType: [''],
      paymentDate: [new Date().toISOString(), Validators.required],
      paymentReference: [''],
      agentname: [''],
      agentId: [''],
      receivedBy: ['', Validators.required],
      accountName: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$')]],
      ifscCode: ['', [Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]],
      amountReceived: ['', [Validators.required, Validators.min(0)]]
    });
}

private validateForm(): boolean {
  // Check if form is valid
  if (!this.loanForm.valid) {
    // Mark all fields as touched to show validation errors
    Object.keys(this.loanForm.controls).forEach(key => {
      const control = this.loanForm.get(key);
      control?.markAsTouched();
      
      // Log invalid controls for debugging
      if (control?.invalid) {
        console.log(`Invalid control: ${key}`, control.errors);
      }
    });
    return false;
  }

  // Validate payment amounts
  const paymentType = this.loanForm.get('paymentType')?.value;
  const amount = parseFloat(this.loanForm.get('amount')?.value);
  const cashAmount = parseFloat(this.loanForm.get('cashAmount')?.value) || 0;
  const onlineAmount = parseFloat(this.loanForm.get('onlineAmount')?.value) || 0;

  if (paymentType === 'Both' && (cashAmount + onlineAmount) !== amount) {
    this.toast.error('Total of cash and online amounts must equal loan amount');
    return false;
  }

  return true;
}

  calculateMaturityDate() {
    const issuedDate = this.loanForm.get('issuedDate')?.value;
    if (issuedDate) {
      const maturityDate = new Date(issuedDate);
      maturityDate.setDate(maturityDate.getDate() + 45);
      
      maturityDate.setHours(23, 59, 59);
      
      this.loanForm.patchValue({
        maturityDate: maturityDate
      });
    }
  }

  private initCityAutocomplete() {
    this.filteredCities = this.loanForm.get('city')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(value => this._filterCities(value || ''))
    );
  }

  private _filterCities(value: any): any[] {
    if (!value) return this.cities;
    
    const filterValue = typeof value === 'string' 
      ? value.toLowerCase()
      : value.name 
        ? value.name.toLowerCase() 
        : '';

    return this.cities.filter(city => 
      city.name.toLowerCase().includes(filterValue)
    );
  }


  displayCityFn = (city: any): string => {
    if (!city) return '';
    return typeof city === 'object' ? city.name : this.cities.find(c => c.branchId === city)?.name || '';
  }

  onCitySelected(event: any) {
    const selectedCity = event.option.value;
    if (selectedCity) {
      this.loanForm.patchValue({
        branchId: selectedCity.branchId
      });
    }
  }
  

  calculateLoanProgress() {
    const today = new Date();
    const issuedDate = new Date(this.loanForm.get('issuedDate')?.value);
    const maturityDate = new Date(this.loanForm.get('maturityDate')?.value);
    
    const totalDays = (maturityDate.getTime() - issuedDate.getTime()) / (1000 * 3600 * 24);
    const daysElapsed = (today.getTime() - issuedDate.getTime()) / (1000 * 3600 * 24);
    
    let progress = (daysElapsed / totalDays) * 100;
    progress = Math.min(Math.max(progress, 0), 100); // Ensure progress is between 0 and 100
    
    this.loanForm.patchValue({
      loanProgress: progress
    });
  }

  onSubmit() {
    if (this.validateForm()) {
      const formData = this.loanForm.value;
      
      // Format dates
      formData.createdAt = new Date().toISOString();
      formData.issuedDate = new Date(formData.issuedDate).toISOString();
      formData.maturityDate = new Date(formData.maturityDate).toISOString();
      formData.paymentDate = new Date(formData.paymentDate).toISOString();
      
      // Format numbers
      formData.amount = parseFloat(formData.amount);
      formData.cashAmount = parseFloat(formData.cashAmount) || 0;
      formData.onlineAmount = parseFloat(formData.onlineAmount) || 0;
      formData.amountReceived = parseFloat(formData.amountReceived);
      
      // Calculate commission
      const selectedLender = this.lenders.find(l => l.lenderName === formData.lender);
      formData.commissionPercentage = selectedLender?.percentage || 0.006;
      formData.commissionAmount = (formData.amount * formData.commissionPercentage).toFixed(2);
      
      // Initialize commission tracking
      formData.receivedCommissions = [];
      formData.receivableCommission = formData.commissionAmount;
      formData.totalReceivedCommission = 0;
      formData.agentname = this.loanForm.get('agentname')?.value;
      
      // Calculate loan progress
      this.calculateLoanProgress();
      formData.loanProgress = this.loanForm.get('loanProgress')?.value;
      
      // Add to service and close dialog
      this.goldLoanService.loans.push(formData);
      this.toast.success('Loan created successfully');
      console.log(this.goldLoanService.loans, formData)
      this.dialogRef.close(formData);
    }
}



calculateCommission() {
  const commission = this.loanForm.get('commission')?.value;
  const amount = this.loanForm.get('amount')?.value;
  
  if (commission && amount) {
    const commissionAmount = (amount * (commission / 100)).toFixed(2);
    this.loanForm.patchValue({
      commissionAmount: commissionAmount
    });
  }
}







}

