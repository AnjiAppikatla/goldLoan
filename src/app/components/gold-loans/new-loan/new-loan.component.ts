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

  lenders: string[] = ['Bajaj', 'HDFC', 'ICICI', 'SBI'];
  merchants: string[] = ['147224577', '147224578', '147224579', '147224580'];
  cities: { branchId: string; name: string }[] = [
    { branchId: 'VZG001', name: 'Vizag - Pendurthi' },
    { branchId: 'VZG002', name: 'Vizag - Madhurawada' },
    { branchId: 'VZG003', name: 'Vizag - Marripalem' },
    { branchId: 'VZG004', name: 'Vizag - Ravindra Nagar' },
    { branchId: 'VJW001', name: 'Vijayawada - Ajith Singh Nagar' },
    { branchId: 'VJW002', name: 'Vijayawada - Bhavanipuram' },
    { branchId: 'VJW003', name: 'Vijayawada - Eluru Road' },
    { branchId: 'VJW004', name: 'Vijayawada - Chitti Nagar' },
    { branchId: 'VJW005', name: 'Vijayawada - Satyanarayanpuram' },
    { branchId: 'VJW006', name: 'Vijayawada - Ramavarapadu' },
    { branchId: 'VJW007', name: 'Vijayawada - Ibrahimpatnam' },
    { branchId: 'VJW008', name: 'Vijayawada - Governorpet' },
    { branchId: 'GNT001', name: 'Guntur - Kothapeta' },
    { branchId: 'NLR001', name: 'Nellore - Kanakamahal Center' },
    { branchId: 'VZG005', name: 'Vizag - Old Gajuwaka' },
    { branchId: 'VZG006', name: 'Vizag - Gopalpatanam' },
    { branchId: 'VZG007', name: 'Vizag - Dwarakanagar' },
    { branchId: 'VZG008', name: 'Vizag - New Gajuwaka' },
    { branchId: 'VZG009', name: 'Vizag - Kanchara Palem' },
    { branchId: 'VZG010', name: 'Vizag - Dabagardens' },
    { branchId: 'VZG011', name: 'Vizag - Pedawaltair' },
    { branchId: 'VZG012', name: 'Vizag - Kurmannapalem' },
    { branchId: 'VZG013', name: 'Vizag - HB Colony' },
    { branchId: 'VZG014', name: 'Vizag - Akkayyapalem' },
    { branchId: 'TPT001', name: 'Tirupati - Bairagi Patteda' },
    { branchId: 'TPT002', name: 'Tirupati - Tilak Road' },
    { branchId: 'TPT003', name: 'Tirupati - Korlagunta' },
    { branchId: 'TPT004', name: 'Tirupati - RC Road' },
    { branchId: 'NLR002', name: 'Nellore - Nawabpet' },
    { branchId: 'NLR003', name: 'Nellore - Vedayapalem' },
    { branchId: 'ANK001', name: 'Anakapalle - Bhargavi Plaza' },
    { branchId: 'GNT002', name: 'Guntakal - Vegetable Market' },
    { branchId: 'KKD001', name: 'Kakinada - Jagannaickpur' },
    { branchId: 'KNL001', name: 'Kurnool - Gandhi Nagar' },
    { branchId: 'RJY001', name: 'Rajahmundry - Devi Chowk' },
    { branchId: 'RCT001', name: 'Rayachoti - Bunglow Road' },
    { branchId: 'ELR001', name: 'Eluru - Vasanth Mahal Street' },
    { branchId: 'ONG001', name: 'Ongole Addanki - Bus Stand Center' },
    { branchId: 'CRL001', name: 'Chirala - Santha Bazar' },
    { branchId: 'GNT003', name: 'Guntur - Arundelpet' },
    { branchId: 'TNL001', name: 'Tenali - Gandhi Chowk' },
    { branchId: 'NDL001', name: 'Nandyal - Srinivas Nagar' },
    { branchId: 'NSP001', name: 'Narasaraopet - Arundelpet' },
    { branchId: 'ATP001', name: 'Anantpur - Subhash Road' },
    { branchId: 'VJW009', name: 'Vijayawada - Moghalrajpuram' },
    { branchId: 'CDP001', name: 'Cuddapah - Bhagyanagar Colony' },
    { branchId: 'AMP001', name: 'Amalapuram - Main Road' },
    { branchId: 'RLW001', name: 'Railway - Koduru Nethaji Road' },
    { branchId: 'SKL001', name: 'Srikalahasti - Main Road' },
    { branchId: 'JRG001', name: 'Jangareddygudem - Eluru Main Road' },
    { branchId: 'VJW018', name: 'Vijayawada - Gurunanak Colony' },
    { branchId: 'ATP002', name: 'ANANTAPUR - KALYANDURG ROAD' },
    { branchId: 'KKD002', name: 'KAKINADA - SARPAVARAM JUNCTION' },
    { branchId: 'TGP001', name: 'Thagarapuvalasa - Bhimili Road' },
    { branchId: 'NSP002', name: 'NARSIPATNAM - MAIN ROAD' },
    { branchId: 'KDR001', name: 'KADIRI - NTR CIRCLE' },
    { branchId: 'CLP001', name: 'CHILAKALURIPET - NRT CENTER' },
    { branchId: 'BDV001', name: 'BADVEL - FOUR ROAD CIRCLE' },
    { branchId: 'RJY002', name: 'RAJAHAMUNDRY - AV APPARAO ROAD' },
    { branchId: 'BBL001', name: 'BOBBILI - PEDA BAZAAR MAIN ROAD' },
    { branchId: 'TNK001', name: 'Tanuku - Velupuru Road' },
    { branchId: 'NDG001', name: 'Nandigama - Main Road' },
    { branchId: 'BPT001', name: 'Bapatla - G B C Road' },
    { branchId: 'PNR001', name: 'Ponnur - Bus Stand' },
    { branchId: 'CTR001', name: 'Chittoor - D I Road' },
    { branchId: 'PLV001', name: 'Pulivendula - Ankalammapetta' },
    { branchId: 'GNT004', name: 'Guntur - Vinukonda' },
    { branchId: 'PVP001', name: 'Parvathipuram - RTC Bus stand' },
    { branchId: 'VZG015', name: 'Vizag - Muralinagar' },
    { branchId: 'VZG016', name: 'Vizag - Pedagantyada' },
    { branchId: 'VZG017', name: 'Vizag - MVP Colony' },
    { branchId: 'VZG018', name: 'Vizag - BGL' },
    { branchId: 'TPT005', name: 'Tirupati - BGL' },
    { branchId: 'GDV001', name: 'Gudivada - BGL' },
    { branchId: 'NLR004', name: 'Nellore - BGL' },
    { branchId: 'PDT001', name: 'Pendhurthi - Main Road' },
    { branchId: 'SBV001', name: 'Sabbavaram - Main Road' },
    { branchId: 'VZG019', name: 'Vizag - PM Palem' },
    { branchId: 'SHP001', name: 'Sriharipuram - APSRTC Depo Gate' },
    { branchId: 'VJW019', name: 'Vijayawada - Krishna Lanka' },
    { branchId: 'KVL001', name: 'Kavali - GNT Road' },
    { branchId: 'GJP001', name: 'Gajapathiagaram - Four Road Junction' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewLoanComponent>,
    private goldLoanService: GoldLoanService,
    private toast: ToastService,
  ) {
    this.initForm();
  }
  ngOnInit() {
    this.initCityAutocomplete();
    this.loanForm.controls['issuedDate'].setValue(new Date().toISOString());
    this.calculateMaturityDate();

    // Subscribe to payment type changes
    this.loanForm.get('paymentType')?.valueChanges.subscribe(paymentType => {
      const amount = this.loanForm.get('amount')?.value;
      if (amount) {
        this.updatePaymentAmounts(amount, paymentType);
      }
    });

       // Subscribe to loan amount changes
       this.loanForm.get('amount')?.valueChanges.subscribe(amount => {
        if (amount) {
          const paymentType = this.loanForm.get('paymentType')?.value;
          this.updatePaymentAmounts(amount, paymentType);
          this.calculateCommissionAmount();
        }
      });

      this.loanForm.get('commission')?.valueChanges.subscribe(percentage => {
        this.calculateCommissionAmount();
      });

      this.loanForm.get('paymentType')?.valueChanges.subscribe(paymentType => {
        const amount = this.loanForm.get('amount')?.value;
        if (amount) {
          this.updatePaymentAmounts(amount, paymentType);
        }
      });

          // Subscribe to cash amount changes
    this.loanForm.get('cashAmount')?.valueChanges.subscribe(cashAmount => {
      if (this.loanForm.get('paymentType')?.value === 'Both' && cashAmount) {
        const totalAmount = this.loanForm.get('amount')?.value || 0;
        const remainingAmount = totalAmount - (parseFloat(cashAmount) || 0);
        if (remainingAmount >= 0) {
          this.loanForm.patchValue({
            onlineAmount: remainingAmount
          }, { emitEvent: false });
        }
      }
    });
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
      merchantId: ['147224577', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      branchId: ['', [Validators.required]],
      city: ['', Validators.required],
      panNumber: ['', [Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      aadharNumber: ['', [Validators.pattern('^[0-9]{12}$')]],
      issuedDate: [new Date().toISOString, Validators.required],
      maturityDate: ['', Validators.required],
      loanProgress: [0],
      commission: [5, Validators.required],
      commissionAmount: ['', Validators.required],
      paymentType: ['Cash', Validators.required],
      cashAmount: [0],
      onlineAmount: [0],
      onlinePaymentType: [''],
      receivedBy: ['', Validators.required],
      paymentDate: [new Date(), Validators.required],
      paymentReference: ['']
    });

    this.loanForm.get('paymentType')?.valueChanges.subscribe(type => {
      const cashAmountControl = this.loanForm.get('cashAmount');
      const onlineAmountControl = this.loanForm.get('onlineAmount');
      const onlinePaymentTypeControl = this.loanForm.get('onlinePaymentType');

      if (type === 'Cash') {
        cashAmountControl?.setValidators([Validators.required, Validators.min(0)]);
        onlineAmountControl?.clearValidators();
        onlinePaymentTypeControl?.clearValidators();
      } else if (type === 'Online') {
        onlineAmountControl?.setValidators([Validators.required, Validators.min(0)]);
        onlinePaymentTypeControl?.setValidators([Validators.required]);
        cashAmountControl?.clearValidators();
      } else if (type === 'Both') {
        cashAmountControl?.setValidators([Validators.required, Validators.min(0)]);
        onlineAmountControl?.setValidators([Validators.required, Validators.min(0)]);
        onlinePaymentTypeControl?.setValidators([Validators.required]);
      }

      cashAmountControl?.updateValueAndValidity();
      onlineAmountControl?.updateValueAndValidity();
      onlinePaymentTypeControl?.updateValueAndValidity();
    });
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
      city.name.toLowerCase().includes(filterValue) ||
      city.branchId.toLowerCase().includes(filterValue)
    );
  }


  displayCityFn = (city: any): string => {
    if (!city) return '';
    return typeof city === 'object' ? city.name : this.cities.find(c => c.branchId === city)?.name || '';
  }

  onCitySelected(event: any) {
    const selectedCity = event.option.value;
    if (selectedCity && selectedCity.branchId) {
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
    if (this.loanForm.valid) {
      const formValue = this.loanForm.value;
      const totalAmount = parseFloat(formValue.amount) || 0;
      const cashAmount = parseFloat(formValue.cashAmount) || 0;
      const onlineAmount = parseFloat(formValue.onlineAmount) || 0;

      // Validate payment amounts match loan amount
      if (formValue.paymentType === 'Both') {
        if (Math.abs((cashAmount + onlineAmount) - totalAmount) > 0.01) {
          this.toast.warning('Total of cash and online amounts must equal the loan amount');
          return;
        }
      } else if (formValue.paymentType === 'Cash' && cashAmount !== totalAmount) {
        this.toast.warning('Cash amount must equal the loan amount');
        return;
      } else if (formValue.paymentType === 'Online' && onlineAmount !== totalAmount) {
        this.toast.warning('Online amount must equal the loan amount');
        return;
      }

      // If validation passes, proceed with form submission
      // ... existing submission code ...
         if (this.loanForm.valid) {
      const amount = this.loanForm.get('amount')?.value;
      if (!amount || amount <= 0) {
        return;
      }
      
      const formData = this.loanForm.value;
      formData.createdAt = new Date().toISOString();
      this.calculateLoanProgress();
      this.dialogRef.close(formData);
      this.goldLoanService.loans.push(formData);
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







}

