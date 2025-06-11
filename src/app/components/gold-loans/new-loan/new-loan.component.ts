import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ControllersService } from '../../../services/controllers.service';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-new-loan',
  standalone: true,
  styles: `
  /* Hide number input arrows in Chrome, Safari, Edge, Opera */
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Hide number input arrows in Firefox */
input[type=number] {
  -moz-appearance: textfield;
}`,
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
  editLoan: any;
  isEdit = false;
  loanForm!: FormGroup;
  

  commissionPercentages: number[] = [5, 7, 9, 11, 13, 15];
  paymentTypes: string[] = ['Cash', 'Online', 'Both'];
  onlinePaymentTypes: string[] = ['UPI', 'Phone pay', 'GooglePay', 'Bank Transfer'];
  receivedByList: string[] = ['Manikanta - savings', 'Revathi - savings', 'Manikanta - current', 'Revathi - current'];

  lenders: any[] = [];
  merchants: any[] = [];
  cities: any[] = [];
  filteredCities: any = [];

  Agents: any = []
  currentUser: any;
  banks: any = [];


  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewLoanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private goldLoanService: GoldLoanService,
    private toast: ToastService,
    private authService: AuthService,
    private controllersService: ControllersService
  ) {
    this.isEdit = data?.isEdit || false;
    if (this.isEdit && data.loan) {
      this.editLoan = data.loan;
    }
  }

  ngOnInit() {
    this.GetAllAgents();
    this.GetAllMerchants();
    this.GetAllLenders();
    this.initForm();
    this.initCityAutocomplete();
    this.loanForm.controls['issuedDate'].setValue(new Date().toISOString());
    this.calculateMaturityDate();

    this.GetAllBranches();
    this.GetAllBanks();

    // this.cities = this.goldLoanService.cities;
    // Subscribe to payment type changes
    this.loanForm.get('paymentType')?.valueChanges.subscribe(paymentType => {
      const cashAmountControl = this.loanForm.get('cashAmount');
      const onlineAmountControl = this.loanForm.get('onlineAmount');
      const onlinePaymentTypeControl = this.loanForm.get('onlinePaymentType');
      const amount = this.loanForm.get('amount')?.value;

      if (paymentType === 'Cash') {
        cashAmountControl?.setValidators([Validators.required, Validators.min(0)]);
        onlineAmountControl?.clearValidators();
        onlinePaymentTypeControl?.clearValidators();
        
        // Clear online payment related fields
        this.loanForm.patchValue({
          onlinePaymentType: '',
          PaymentaccountName: '',
          PaymentaccountNumber: '',
          PaymentifscCode: ''
        });
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

      if (amount) {
        this.updatePaymentAmounts(amount, paymentType);
      }
    });

    // this.loanForm.get('amount')?.valueChanges.subscribe(amount => {
    //   if (amount) {
    //     const paymentType = this.loanForm.get('paymentType')?.value;
    //     this.updatePaymentAmounts(amount, paymentType);
    //     this.loanForm.patchValue({
    //       amountReceived: amount
    //     }, { emitEvent: false });
    //   }
    // });

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
      // this.Agents = this.authService.users.filter(user => user.role === 'agent');
      // For admin, enable selecting agent and their ID
      this.loanForm.get('agentname')?.valueChanges.subscribe(agentName => {
        const selectedAgent = this.Agents.find((agent: any) => agent.name === agentName);
        if (selectedAgent) {
          this.loanForm.patchValue({
            agentId: selectedAgent.id
          }, { emitEvent: false }); // Add emitEvent: false to prevent circular updates
        }
      });
    }

    this.loanForm.get('panNumber')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        this.loanForm.get('pan')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });

    this.loanForm.get('ifscCode')?.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        this.loanForm.get('pan')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });

    if (this.isEdit && this.editLoan) {
      setTimeout(() => {
        const cities = this.cities
        cities.map((city: any) => {
          if (city.name === this.editLoan.City) {
            this.loanForm.patchValue({
              branchId: city.branchId,
              city: city
            });
          }
        });
        this.loanForm.patchValue({
          lender: this.editLoan.Lender,
          agentname: this.editLoan.AgentName,
          leadId: this.editLoan.LeadId,
          name: this.editLoan.Name,
          mobileNo: this.editLoan.MobileNo,
          merchantId: this.editLoan.MerchantId,
          amount: this.editLoan.Amount,
          issuedDate: new Date(this.editLoan.IssuedDate),
          maturityDate: new Date(this.editLoan.MaturityDate),
          agentId: this.editLoan.AgentId,
          // city: city.name || null,
          // branchId: city.branchId || null,
          paymentType: this.editLoan.PaymentType,
          cashAmount: this.editLoan.CashAmount,
          onlineAmount: this.editLoan.OnlineAmount,
          onlinePaymentType: this.editLoan.OnlinePaymentType,
          paymentDate: new Date(this.editLoan.PaymentDate),
          ReceivedDate: new Date(this.editLoan.ReceivedDate),
          paymentReference: this.editLoan.PaymentReference,
          receivedBy: this.editLoan.ReceivedBy,
          PaymentaccountName: this.editLoan.PaymentAccountName,
          PaymentaccountNumber: this.editLoan.PaymentAccountNumber,
          PaymentifscCode: this.editLoan.PaymentIfscCode,
          ReceivedaccountName: this.editLoan.ReceivedAccountName,
          ReceivedaccountNumber: this.editLoan.ReceivedAccountNumber,
          ReceivedifscCode: this.editLoan.ReceivedIfscCode,
          aadharNumber: this.editLoan.AadharNumber,
          panNumber: this.editLoan.PanNumber
        });
      }, 1000); // Delay for 1 second to ensure data is availabl
    
    }

    if (this.data?.indentLoan) {
      setTimeout(() => {
      const loanData = this.data.indentLoan;
      const cities = this.cities
        cities.map((city: any) => {
          if (city.name === loanData.city) {
            this.loanForm.patchValue({
              branchId: city.branchId,
              city: city
            });
          }
        });
      this.loanForm.patchValue({
        name: loanData.name,
        amount: loanData.amount,
        onlineAmount: loanData.amount,
        agentname: this.Agents.find((agent:any) => agent.name === loanData.agent)?.name,
        merchantId: loanData.merchantid,
        lender: loanData.lender,
        // city: loanData.City,
        issuedDate: new Date(loanData.created_at),
        ReceivedaccountName: loanData.accountName,
        ReceivedaccountNumber: loanData.accountNumber,
        ReceivedifscCode: loanData.ifscCode,
        PaymentaccountName: loanData.accountName,
        PaymentaccountNumber: loanData.accountNumber,
        PaymentifscCode: loanData.ifscCode
          // Add other fields as needed
      });
      },1000)
    }
  }

  GetAllAgents() {
    this.controllersService.GetAllAgents().subscribe(
      (response) => {
        setTimeout(() => {
          this.Agents = response;
        }, 300); // Delay for 1 second to ensure data is availabl
      },
      (error) => {
        console.error('Error fetching agents:', error);
      }
    );
  }

  GetAllBranches() {
    this.controllersService.GetAllBranches().subscribe(
      (response) => {
        this.cities = response;
        this.initCityAutocomplete();
      },
      (error) => {
        console.error('Error fetching branches:', error);
      }
    );
  }

  GetAllLenders() {
    this.controllersService.GetAllLenders().subscribe(
      (response) => {
        this.lenders = response;
      },
      (error) => {
        console.error('Error fetching lenders:', error);
        this.initForm()
      }
    );
  }

  GetAllMerchants() {
    this.controllersService.GetAllMerchants().subscribe(
      (response) => {
        this.merchants = response;
        // this.initForm()
      },
      (error) => {
        console.error('Error fetching merchants:', error);
        this.initForm()
      }
    );
  }

  private updatePaymentAmounts(totalAmount: number, paymentType: string) {
    const amount = Number(totalAmount);
    switch (paymentType) {
      case 'Cash':
        this.loanForm.patchValue({
          cashAmount: amount,
          onlineAmount: 0,
          amountReceived: amount
        }, { emitEvent: false });
        break;
      case 'Online':
        this.loanForm.patchValue({
          cashAmount: 0,
          onlineAmount: amount,
          amountReceived: amount
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
      lender: ['', [Validators.required]],
      leadId: [''],
      agentname: [{
        value: this.currentUser?.name || '',
        disabled: this.currentUser?.role === 'agent'
      }, [Validators.required]],
      name: ['', [Validators.required]],
      merchantId: ['', [Validators.required]],
      // mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      mobileNo: [''],
      amount: [''],
      commission: [''],
      commissionAmount: [''],
      branchId: ['', [Validators.required]],
      city: ['', [Validators.required]],
      panNumber: ['',[this.panValidator]],
      aadharNumber: ['', [
        Validators.required,
        Validators.pattern(/^[2-9]{1}[0-9]{11}$/)
      ]],
      issuedDate: [new Date().toISOString(), Validators.required],
      maturityDate: ['', Validators.required],
      loanProgress: [0],
      paymentType: ['Online'],
      cashAmount: [0],
      onlineAmount: [0],
      onlinePaymentType: ['Bank Transfer'],
      paymentDate: [new Date().toISOString()],
      ReceivedDate: [new Date().toISOString()],
      paymentReference: [''],
      agentId: [{
        value: this.currentUser?.id || '',
        disabled: this.currentUser?.role === 'agent'
      }],
      receivedBy: [''],
      PaymentaccountName: [''],
      PaymentaccountNumber: ['', [Validators.pattern('^[0-9]{9,18}$')]],
      PaymentifscCode: ['', [Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]],
      ReceivedaccountName: [''],
      ReceivedaccountNumber: ['', [Validators.pattern('^[0-9]{9,18}$')]],
      ReceivedifscCode: ['', [Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]],
      amountReceived: ['']
    });

      // // Add form status listener
      // this.loanForm.statusChanges.subscribe(status => {
      //   if (status === 'INVALID') {
      //     this.highlightInvalidControls();
      //   }
      // });
}



  panValidator(control: AbstractControl): ValidationErrors | null {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // Valid PAN format

  return panRegex.test(control.value) ? null : { invalidPan: true };
}

// private highlightInvalidControls() {
//   Object.keys(this.loanForm.controls).forEach(key => {
//       const control = this.loanForm.get(key);
//       if (control?.invalid && (control?.dirty || control?.touched)) {
//           const errors = control.errors;
//           if (errors) {
//               let errorMessage = '';
//               if (errors['required']) {
//                   errorMessage = `${key} is required`;
//               } else if (errors['pattern']) {
//                   errorMessage = `Invalid ${key} format`;
//               } else if (errors['min']) {
//                   errorMessage = `${key} must be greater than ${errors['min'].min}`;
//               }
//               this.toast.error(errorMessage);
//           }
//       }
//   });
// }

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
        branchId: selectedCity.branchId,
        city: selectedCity
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

  // private prepareLoanData() {
  //   const formData = this.loanForm.value;
    
  //   const loanData: {
  //     id?: string; // Make id optional with '?'
  //     Lender: any;
  //     AgentName: any;
  //     LeadId: any;
  //     Name: any;
  //     MobileNo: any;
  //     MerchantId: any;
  //     Amount: any;
  //     IssuedDate: string;
  //     MaturityDate: string;
  //     City: any;
  //     PaymentType: any;
  //     CashAmount: any;
  //     OnlineAmount: any;
  //     OnlinePaymentType: any;
  //     PaymentDate: string | null;
  //     PaymentReference: any;
  //     ReceivedBy: any;
  //     AccountName: any;
  //     AccountNumber: any;
  //     IfscCode: any;
  //     AadharNumber: any;
  //     PanNumber: any;
  //     Progress: number;
  //     CreatedAt: string;
  //     UpdatedAt: string;
  //   } = {
  //     Lender: formData.lender,
  //     AgentName: formData.agentname,
  //     LeadId: formData.leadId,
  //     Name: formData.name,
  //     MobileNo: formData.mobileNo,
  //     MerchantId: formData.merchantId,
  //     Amount: formData.amount,
  //     IssuedDate: new Date(formData.issuedDate).toISOString(),
  //     MaturityDate: new Date(formData.maturityDate).toISOString(),
  //     City: formData.city,
  //     PaymentType: formData.paymentType,
  //     CashAmount: formData.cashAmount || 0,
  //     OnlineAmount: formData.onlineAmount || 0,
  //     OnlinePaymentType: formData.onlinePaymentType,
  //     PaymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
  //     PaymentReference: formData.paymentReference,
  //     ReceivedBy: formData.receivedBy,
  //     AccountName: formData.accountName,
  //     AccountNumber: formData.accountNumber,
  //     IfscCode: formData.ifscCode,
  //     AadharNumber: formData.aadharNumber,
  //     PanNumber: formData.panNumber,
  //     Progress: formData.loanProgress || 0,
  //     CreatedAt: this.isEdit ? this.editLoan.CreatedAt : new Date().toISOString(),
  //     UpdatedAt: new Date().toISOString()
  //   };

  //   return loanData;
  // }

  // onSubmit() {
  //   if (this.validateForm()) {
  //     const loanData = this.prepareLoanData();

  //     if (this.isEdit) {
  //       loanData.id = this.editLoan.id;
  //       this.controllersService.UpdateLoan(loanData).subscribe({
  //         next: (response) => {
  //           if (response) {
  //             this.toast.success('Loan updated successfully');
  //             this.dialogRef.close(true);
  //           }
  //         },
  //         error: (error) => {
  //           this.toast.error('Error updating loan');
  //         }
  //       });
  //     } else {
  //       this.controllersService.CreateLoan(loanData).subscribe({
  //         next: (response) => {
  //           if (response) {
  //             this.toast.success('Loan created successfully');
  //             this.dialogRef.close(true);
  //           }
  //         },
  //         error: (error) => {
  //           this.toast.error('Error creating loan');
  //         }
  //       });
  //     }
  //   }
  // }


  onSubmit() {
    
    if (this.validateForm()) {

      // const loanData = this.prepareLoanData();

      const loanData = this.loanForm.value;
      // loanData.commission = loanData.commission ? loanData.commission : {};

      if (this.isEdit) {
        loanData.id = this.editLoan.Id;
        loanData.city = this.loanForm.value.city.name;

        if(this.editLoan.commissionPercentage == null){
          const selectedLender = this.lenders.find(l => l.lenderName === loanData.lender);
          loanData.commissionPercentage = selectedLender?.percentage || 0.006;
          loanData.commissionAmount = (loanData.amount * loanData.commissionPercentage).toFixed(2);
        }
        else{
          loanData.commissionPercentage = this.editLoan.commissionPercentage;
        }

        
        this.controllersService.UpdateLoan(loanData, Number(loanData.id)).subscribe({
          next: (response) => {
            if (response) {
              this.toast.success('Loan updated successfully');
              this.dialogRef.close(true);
            }
          },
          error: (error) => {
            this.toast.error('Error updating loan');
          }
        });
        this.dialogRef.close(loanData);
      }
      else{
        const formData = this.loanForm.value;

        // Format dates
        formData.createdAt = new Date().toISOString();
        formData.issuedDate = new Date(formData.issuedDate).toISOString();
        formData.maturityDate = new Date(formData.maturityDate).toISOString();
        formData.paymentDate = new Date(formData.paymentDate).toISOString();
        formData.city = formData.city.name;
        if(formData.agentId == null){
          formData.agentId = this.loanForm.get('agentId')?.value;
        }
  
        // Format numbers
        formData.amount = parseFloat(formData.amount);
        formData.cashAmount = parseFloat(formData.cashAmount) || 0;
        formData.onlineAmount = parseFloat(formData.onlineAmount) || 0;
        formData.amountReceived = parseFloat(formData.amountReceived) || 0;
  
        // Calculate commission
        const selectedLender = this.lenders.find(l => l.lenderName === formData.lender);
        formData.commissionPercentage = selectedLender?.percentage || 0.006;
        formData.commissionAmount = (formData.amount * formData.commissionPercentage).toFixed(2);
  
        // Initialize commission tracking
        // formData.receivedCommissions = [];
        // formData.receivableCommission = formData.commissionAmount;
        // formData.totalReceivedCommission = 0;
        formData.agentname = this.loanForm.get('agentname')?.value;
        formData.agentId = this.Agents.filter((a:any) => a.name === formData.agentname).userId;
        
  
        // Calculate loan progress
        // this.calculateLoanProgress();
        // formData.loanProgress = this.loanForm.get('loanProgress')?.value;
  
        // Add to service and close dialog
        // this.goldLoanService.loans.push(formData);
        // this.toast.success('Loan created successfully');
        this.controllersService.CreateLoan(formData).subscribe(
          (response) => {
            this.toast.success('Loan Created Successfully');
            // Handle success, e.g., show a success message
          },
          (error) => {
            console.error('Error creating loan:', error);
            // Handle error, e.g., show an error message
          }
        );
        this.dialogRef.close(formData);
      }


      
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

  GetAllBanks() {
    this.controllersService.GetAllBankDetails().subscribe({
      next: (response) => {
        this.banks = response.data;
      },
      error: (error) => {
        console.error('Error fetching bank accounts');
      }
    });
  }







}

