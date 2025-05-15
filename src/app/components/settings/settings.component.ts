import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { GoldLoanService } from '../../services/gold-loan.service';
import { ToastService } from '../../services/toastr.service';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ControllersService } from '../../services/controllers.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CityService } from '../../services/city.service';
import { debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { AddressService } from '../../services/address.service';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatExpansionModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatTableModule,
    MatMenuModule,
    MatAutocompleteModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  agentForm!: FormGroup;
  branchForm!: FormGroup;
  lenderForm!: FormGroup;
  merchantForm!: FormGroup;

  

  @ViewChild('agentDialog') agentDialog!: TemplateRef<any>;
  @ViewChild('branchDialog') branchDialog!: TemplateRef<any>;
  @ViewChild('lenderDialog') lenderDialog!: TemplateRef<any>;
  @ViewChild('merchantDialog') merchantDialog!: TemplateRef<any>;

  

  cities : any = [];
  agents: any[] = [];
  branches: any[] = [];
  lenders: any[] = [];
  merchants: any[] = [];
  loans: any[] = [];
  isEdit: boolean = false;

  filteredBranches: any[] = [];
  filteredLenders: any[] = [];
  filteredMerchants: any[] = [];
  filteredAgents: any[] = [];

  filteredLoans: any[] = [
    // {
    //   aadharNumber: "123456789012",
    //   accountName: "Anji",
    //   accountNumber: "312321323121",
    //   amount: 30000,
    //   amountReceived: 30000,
    //   branchId: "123",
    //   cashAmount: 0,
    //   city: "Guntur - Arundelpet",
    //   commission: 0.006,
    //   commissionAmount: "180.00",
    //   commissionPercentage: 0.006,
    //   createdAt: "2025-04-24T17:52:12.924Z",
    //   ifscCode: "",
    //   issuedDate: "2025-04-24T17:52:03.289Z",
    //   leadId: "13213213",
    //   lender: "Bajaj",
    //   loanProgress: 0.00024766880293326235,
    //   maturityDate: "2025-06-08T18:29:59.289Z",
    //   merchantId: "147224577",
    //   mobileNo: "1233444444",
    //   name: "testing name 2",
    //   onlineAmount: 0,
    //   onlinePaymentType: "",
    //   panNumber: "",
    //   paymentDate: "2025-04-24T17:52:03.225Z",
    //   paymentReference: "",
    //   paymentType: "Cash",
    //   receivableCommission: "180.00",
    //   receivedBy: "Manikanta - savings",
    //   receivedCommissions: [],
    //   totalReceivedCommission: 0
    // },
    // {
    //   aadharNumber: "123456789012",
    //   accountName: "Anji",
    //   accountNumber: "312321323121",
    //   amount: 30000,
    //   amountReceived: 30000,
    //   branchId: "123",
    //   cashAmount: 0,
    //   city: "Guntur - Arundelpet",
    //   commission: 0.006,
    //   commissionAmount: "180.00",
    //   commissionPercentage: 0.006,
    //   createdAt: "2025-04-24T17:52:12.924Z",
    //   ifscCode: "",
    //   issuedDate: "2025-04-24T17:52:03.289Z",
    //   leadId: "13213213",
    //   lender: "Bajaj",
    //   loanProgress: 0.00024766880293326235,
    //   maturityDate: "2025-06-08T18:29:59.289Z",
    //   merchantId: "147224577",
    //   mobileNo: "1233444444",
    //   name: "testing name 2",
    //   onlineAmount: 0,
    //   onlinePaymentType: "",
    //   panNumber: "",
    //   paymentDate: "2025-04-24T17:52:03.225Z",
    //   paymentReference: "",
    //   paymentType: "Cash",
    //   receivableCommission: "180.00",
    //   receivedBy: "Manikanta - savings",
    //   receivedCommissions: [],
    //   totalReceivedCommission: 0
    // }

  ];
  filteredCities!: Observable<string[]>;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private authService: AuthService,
    private goldLoanService: GoldLoanService,
    private toast: ToastService,
    private controllersService: ControllersService,
    private addressService: AddressService
  ) {
    this.initializeForms();
  }

  ngOnInit(){
    this.loadData();
    this.filteredBranches = this.branches;
    this.filteredLenders = this.lenders;
    this.filteredMerchants = this.merchants;
    this.filteredAgents = this.agents;

    this.GetAllAgents();
    this.GetAllBranches();
    this.GetAllLenders();
    this.GetAllMerchants();
    
  }

  searchAgents(event: any) {
    const searchTerm = (event.target.value || '').toLowerCase();
    this.filteredAgents = this.agents.filter(agent => 
      (agent.name || '').toLowerCase().includes(searchTerm) ||
      (agent.email || '').toLowerCase().includes(searchTerm) ||
      (agent.branch || '').toLowerCase().includes(searchTerm)
    );
  }

  editAgent(agent: any) {
    this.isEdit = true;
    this.agentForm.patchValue({
      name: agent.name,
      email: agent.email,
      branch: agent.branch,
      password: '' // Password field is cleared for security
    });
    this.dialog.open(this.agentDialog, {
      width: '400px',
      disableClose: true
    });
  }

  deleteAgent(email: string) {
    if (confirm('Are you sure you want to delete this agent?')) {
      this.authService.deleteUser(email);
      this.loadData();
      this.toast.success('Agent deleted successfully');
    }
  }

  saveAgent() {
    if (this.agentForm.valid) {
      const agentData = {
        ...this.agentForm.value,
        role: 'agent' // Explicitly setting the role to 'agent'
      };
      
      if (this.isEdit) {
        this.authService.updateUser(agentData);
        this.toast.success('Agent updated successfully');
      } else {
        this.authService.addUser(agentData);
        this.toast.success('Agent added successfully');
      }
      this.closeDialog();
      this.loadData();
    }
  }

  searchBranches(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredBranches = this.branches.filter(branch => 
      branch.name.toLowerCase().includes(searchTerm) || 
      // branch.city.toLowerCase().includes(searchTerm) ||
      branch.branchId.toLowerCase().includes(searchTerm)
    );
  }

  searchLenders(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredLenders = this.lenders.filter(lender => 
      lender.name.toLowerCase().includes(searchTerm)
    );
  }

  searchMerchants(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredMerchants = this.merchants.filter(merchant => 
      merchant.merchantName.toLowerCase().includes(searchTerm) ||
      merchant.merchantId.toLowerCase().includes(searchTerm) ||
      merchant.contactNumber.includes(searchTerm)
    );
  }


  commissionEnterClick(id: any) {
    // ... existing code ...
    this.loans.forEach((loan) => {
      if (loan.leadId === id) {
        const receivedCommission = {
          receivedCommission: loan.commissionAmount,
          receivedDate: new Date()
        };
        if (!loan.receivedCommissions) {
          loan.receivedCommissions = [];
        }
        loan.receivedCommissions.push(receivedCommission);
        this.goldLoanService.updateCommission(id,loan);
      }
    });
  }

  editBranch(branch: any) {
    this.isEdit = true;
    this.branchForm.patchValue(branch);
    this.dialog.open(this.branchDialog, {
      width: '400px',
      disableClose: true
    });
  }

  deleteBranch(branchId: string) {
    if (confirm('Are you sure you want to delete this branch?')) {
      this.goldLoanService.deleteBranch(branchId);
      this.loadData();
      this.toast.success('Branch deleted successfully');
    }
  }

  editLender(lender: any) {
    this.isEdit = true;
    this.lenderForm.patchValue(lender);
    this.dialog.open(this.lenderDialog, {
      width: '400px',
      disableClose: true
    });
  }

  deleteLender(name: string) {
    if (confirm('Are you sure you want to delete this lender?')) {
      this.goldLoanService.deleteLender(name);
      this.loadData();
      this.toast.success('Lender deleted successfully');
    }
  }

  editMerchant(merchant: any) {
    this.isEdit = true;
    this.merchantForm.patchValue(merchant);
    this.dialog.open(this.merchantDialog, {
      width: '400px',
      disableClose: true
    });
  }

  deleteMerchant(merchantId: string) {
    if (confirm('Are you sure you want to delete this merchant?')) {
      this.goldLoanService.deleteMerchant(merchantId);
      this.loadData();
      this.toast.success('Merchant deleted successfully');
    }
  }

  private loadData() {
    // Load data from services
    this.agents = this.authService.users.filter(user => user.role === 'agent');
     this.branches = this.goldLoanService.getBranches();
    this.lenders = this.goldLoanService.getLenders();
    this.merchants = this.goldLoanService.getMerchants();
  }

  openAgentDialog() {
    this.agentForm.reset();
    this.dialog.open(this.agentDialog, {
      width: '400px',
      disableClose: true
    });
  }

  openBranchDialog() {
    this.isEdit = false;
    this.branchForm.reset();
    this.dialog.open(this.branchDialog, {
      width: '400px',
      disableClose: true
    });
  }

  openLenderDialog() {
    this.isEdit = false;
    this.lenderForm.reset();
    this.dialog.open(this.lenderDialog, {
      width: '400px',
      disableClose: true
    });
  }

  openMerchantDialog() {
    this.isEdit = false;
    this.merchantForm.reset();
    this.dialog.open(this.merchantDialog, {
      width: '400px',
      disableClose: true
    });
  }

  private closeDialog() {
    this.dialog.closeAll();
    this.loadData();
  }

  private initializeForms() {
    this.agentForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      branch: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.branchForm = this.fb.group({
      branchId: ['', Validators.required],
      name: ['', Validators.required]
      // city: ['', Validators.required]
    });

    this.lenderForm = this.fb.group({
      name: ['', Validators.required],
      commission: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    this.merchantForm = this.fb.group({
      merchantId: ['', Validators.required],
      merchantName: ['', Validators.required],
      contactNumber: ['', Validators.required]
    });
  }

  // saveAgent() {
  //   if (this.agentForm.valid) {
  //     // Save agent using auth service
  //     const newAgent = {
  //       ...this.agentForm.value,
  //       role: 'agent'
  //     };
  //     // Add to users array in auth service
  //     this.toast.success('Agent added successfully');
  //     this.agentForm.reset();
  //   }
  // }

  saveBranch() {
    if (this.branchForm.valid) {
      const branchData = this.branchForm.value;
      const dialogRef = this.dialog.getDialogById('branchDialog');
      const isEdit = dialogRef?.componentInstance?.data?.isEdit;

      if (isEdit) {
        this.goldLoanService.updateBranch(branchData);
        this.toast.success('Branch updated successfully');
      } else {
        this.goldLoanService.addBranch(branchData);
        this.toast.success('Branch added successfully');
      }
      this.closeDialog();
      this.loadData();
    }
  }

  saveLender() {
    if (this.lenderForm.valid) {
      const lenderData = this.lenderForm.value;
      const dialogRef = this.dialog.getDialogById('lenderDialog');
      const isEdit = dialogRef?.componentInstance?.data?.isEdit;

      if (isEdit) {
        this.goldLoanService.updateLender(lenderData);
        this.toast.success('Lender updated successfully');
      } else {
        this.goldLoanService.addLender(lenderData);
        this.toast.success('Lender added successfully');
      }
      this.closeDialog();
      this.loadData();
    }
  }

  saveMerchant() {
    if (this.merchantForm.valid) {
      const merchantData = this.merchantForm.value;
      const dialogRef = this.dialog.getDialogById('merchantDialog');
      const isEdit = dialogRef?.componentInstance?.data?.isEdit;

      if (isEdit) {
        this.goldLoanService.updateMerchant(merchantData);
        this.toast.success('Merchant updated successfully');
      } else {
        this.goldLoanService.addMerchant(merchantData);
        this.toast.success('Merchant added successfully');
      }
      this.closeDialog();
      this.loadData();
    }
  }

  GetAllBranches() {
    this.controllersService.GetAllBranches().subscribe((data: any) => {
      if(data){
        this.branches = data;
      }
    })
  }

  GetAllLenders() {
    this.controllersService.GetAllLenders().subscribe((data: any) => {
      if(data){
        this.lenders = data;
      }
    })
  }

  GetAllMerchants() {
    this.controllersService.GetAllMerchants().subscribe((data: any) => {
      if(data){
        this.merchants = data;
      }
    })
  }

  GetAllAgents() {
    this.controllersService.GetAllAgents().subscribe((data: any) => {
      if(data){
        this.agents = data;
      }
    })
  }

  onCityInput(event: any) {
    const query = event.target.value;
    if (query && query.length > 2) {
      this.addressService.searchAddress(query).subscribe((data: string[]) => {
        this.cities = data;
        this.filteredCities = of(this.cities);
      });
    } else {
      this.filteredCities = of([]);
    }
  }

  displayCityFn(city: string): string {
    return city || '';
  }



}
