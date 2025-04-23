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

  lenders: string[] = ['Bajaj', 'HDFC', 'ICICI', 'SBI'];
  merchants: string[] = ['147224577', '147224578', '147224579', '147224580'];
  cities: { id: string; name: string }[] = [
    { id: 'VZG001', name: 'Vizag - Pendurthi' },
    { id: 'VZG002', name: 'Vizag - Madhurawada' },
    { id: 'VZG003', name: 'Vizag - Marripalem' },
    { id: 'VZG004', name: 'Vizag - Ravindra Nagar' },
    { id: 'VJW001', name: 'Vijayawada - Ajith Singh Nagar' },
    { id: 'VJW002', name: 'Vijayawada - Bhavanipuram' },
    { id: 'VJW003', name: 'Vijayawada - Eluru Road' },
    { id: 'VJW004', name: 'Vijayawada - Chitti Nagar' },
    { id: 'VJW005', name: 'Vijayawada - Satyanarayanpuram' },
    { id: 'VJW006', name: 'Vijayawada - Ramavarapadu' },
    { id: 'VJW007', name: 'Vijayawada - Ibrahimpatnam' },
    { id: 'VJW008', name: 'Vijayawada - Governorpet' },
    { id: 'GNT001', name: 'Guntur - Kothapeta' },
    { id: 'NLR001', name: 'Nellore - Kanakamahal Center' },
    { id: 'VZG005', name: 'Vizag - Old Gajuwaka' },
    { id: 'VZG006', name: 'Vizag - Gopalpatanam' },
    { id: 'VZG007', name: 'Vizag - Dwarakanagar' },
    { id: 'VZG008', name: 'Vizag - New Gajuwaka' },
    { id: 'VZG009', name: 'Vizag - Kanchara Palem' },
    { id: 'VZG010', name: 'Vizag - Dabagardens' },
    { id: 'VZG011', name: 'Vizag - Pedawaltair' },
    { id: 'VZG012', name: 'Vizag - Kurmannapalem' },
    { id: 'VZG013', name: 'Vizag - HB Colony' },
    { id: 'VZG014', name: 'Vizag - Akkayyapalem' },
    { id: 'TPT001', name: 'Tirupati - Bairagi Patteda' },
    { id: 'TPT002', name: 'Tirupati - Tilak Road' },
    { id: 'TPT003', name: 'Tirupati - Korlagunta' },
    { id: 'TPT004', name: 'Tirupati - RC Road' },
    { id: 'NLR002', name: 'Nellore - Nawabpet' },
    { id: 'NLR003', name: 'Nellore - Vedayapalem' },
    { id: 'ANK001', name: 'Anakapalle - Bhargavi Plaza' },
    { id: 'GNT002', name: 'Guntakal - Vegetable Market' },
    { id: 'KKD001', name: 'Kakinada - Jagannaickpur' },
    { id: 'KNL001', name: 'Kurnool - Gandhi Nagar' },
    { id: 'RJY001', name: 'Rajahmundry - Devi Chowk' },
    { id: 'RCT001', name: 'Rayachoti - Bunglow Road' },
    { id: 'ELR001', name: 'Eluru - Vasanth Mahal Street' },
    { id: 'ONG001', name: 'Ongole Addanki - Bus Stand Center' },
    { id: 'CRL001', name: 'Chirala - Santha Bazar' },
    { id: 'GNT003', name: 'Guntur - Arundelpet' },
    { id: 'TNL001', name: 'Tenali - Gandhi Chowk' },
    { id: 'NDL001', name: 'Nandyal - Srinivas Nagar' },
    { id: 'NSP001', name: 'Narasaraopet - Arundelpet' },
    { id: 'ATP001', name: 'Anantpur - Subhash Road' },
    { id: 'VJW009', name: 'Vijayawada - Moghalrajpuram' },
    { id: 'CDP001', name: 'Cuddapah - Bhagyanagar Colony' },
    { id: 'AMP001', name: 'Amalapuram - Main Road' },
    { id: 'RLW001', name: 'Railway - Koduru Nethaji Road' },
    { id: 'SKL001', name: 'Srikalahasti - Main Road' },
    { id: 'JRG001', name: 'Jangareddygudem - Eluru Main Road' },
    { id: 'VJW018', name: 'Vijayawada - Gurunanak Colony' },
    { id: 'ATP002', name: 'ANANTAPUR - KALYANDURG ROAD' },
    { id: 'KKD002', name: 'KAKINADA - SARPAVARAM JUNCTION' },
    { id: 'TGP001', name: 'Thagarapuvalasa - Bhimili Road' },
    { id: 'NSP002', name: 'NARSIPATNAM - MAIN ROAD' },
    { id: 'KDR001', name: 'KADIRI - NTR CIRCLE' },
    { id: 'CLP001', name: 'CHILAKALURIPET - NRT CENTER' },
    { id: 'BDV001', name: 'BADVEL - FOUR ROAD CIRCLE' },
    { id: 'RJY002', name: 'RAJAHAMUNDRY - AV APPARAO ROAD' },
    { id: 'BBL001', name: 'BOBBILI - PEDA BAZAAR MAIN ROAD' },
    { id: 'TNK001', name: 'Tanuku - Velupuru Road' },
    { id: 'NDG001', name: 'Nandigama - Main Road' },
    { id: 'BPT001', name: 'Bapatla - G B C Road' },
    { id: 'PNR001', name: 'Ponnur - Bus Stand' },
    { id: 'CTR001', name: 'Chittoor - D I Road' },
    { id: 'PLV001', name: 'Pulivendula - Ankalammapetta' },
    { id: 'GNT004', name: 'Guntur - Vinukonda' },
    { id: 'PVP001', name: 'Parvathipuram - RTC Bus stand' },
    { id: 'VZG015', name: 'Vizag - Muralinagar' },
    { id: 'VZG016', name: 'Vizag - Pedagantyada' },
    { id: 'VZG017', name: 'Vizag - MVP Colony' },
    { id: 'VZG018', name: 'Vizag - BGL' },
    { id: 'TPT005', name: 'Tirupati - BGL' },
    { id: 'GDV001', name: 'Gudivada - BGL' },
    { id: 'NLR004', name: 'Nellore - BGL' },
    { id: 'PDT001', name: 'Pendhurthi - Main Road' },
    { id: 'SBV001', name: 'Sabbavaram - Main Road' },
    { id: 'VZG019', name: 'Vizag - PM Palem' },
    { id: 'SHP001', name: 'Sriharipuram - APSRTC Depo Gate' },
    { id: 'VJW019', name: 'Vijayawada - Krishna Lanka' },
    { id: 'KVL001', name: 'Kavali - GNT Road' },
    { id: 'GJP001', name: 'Gajapathiagaram - Four Road Junction' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewLoanComponent>,
    private goldLoanService: GoldLoanService
  ) {
    this.initForm();
  }
  ngOnInit() {
    this.initCityAutocomplete();
    this.loanForm.controls['issuedDate'].setValue(new Date().toISOString());
    this.calculateMaturityDate();

    // Subscribe to commission and amount changes
    this.loanForm.get('commission')?.valueChanges.subscribe(() => {
      this.calculateCommission();
    });

    this.loanForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateCommission();
    });
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

  private _filterCities(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(city => 
      city.name.toLowerCase().includes(filterValue) ||
      city.id.toLowerCase().includes(filterValue)
    );
  }


  displayCityFn = (city: any): string => {
    if (!city) return '';
    return typeof city === 'object' ? city.name : this.cities.find(c => c.id === city)?.name || '';
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
      const formData = this.loanForm.value;
      console.log(formData);
      const commission = this.loanForm.get('commission')?.value;
      const amount = this.loanForm.get('amount')?.value;
      
      formData.createdAt = new Date().toISOString();
      formData.commissionAmount = (amount * (commission / 100)).toFixed(2);
      
      this.calculateLoanProgress();
      this.dialogRef.close(formData);
      this.goldLoanService.loans.push(formData);
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

  calculatePayoutMargins() {
    const amount = this.loanForm.get('amount')?.value;
    if (amount) {
      const margin70 = (amount * 0.7).toFixed(2);
      const margin30 = (amount * 0.3).toFixed(2);
      this.loanForm.patchValue({
        payoutMargin70: margin70,
        payoutMargin30: margin30
      });
    }
  }





}

