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
import { debounceTime, map, Observable, of, startWith, switchMap, take } from 'rxjs';
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

  filteredLoans: any[] = [];
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

    this.GetAllAgents();
    this.GetAllBranches();
    this.GetAllLenders();
    this.GetAllMerchants();

   setTimeout(() => {
    this.filteredBranches = this.branches;
    this.filteredLenders = this.lenders;
    this.filteredMerchants = this.merchants;
    this.filteredAgents = this.agents;
   }, 1000);
    
  }

  searchAgents(event: any) {
    const searchTerm = (event.target.value || '').toLowerCase();
    this.filteredAgents = this.agents.filter(agent => 
      (agent.name || '').toLowerCase().includes(searchTerm)
      // (agent.name || '').toLowerCase().includes(searchTerm) ||
      // (agent.email || '').toLowerCase().includes(searchTerm) ||
      // (agent.branch || '').toLowerCase().includes(searchTerm)
    );
  }

  updateAgent(){
    this.dialog.closeAll();
  }

  editAgent(agent: any) {
    this.isEdit = true;
    this.agentForm.patchValue({
      name: agent.name,
      username: agent.username,
      branch: agent.branch,
      role:agent.role,
      password: agent.password,
      mobile: agent.mobile,
      merchantId: agent.merchantId
    });
    this.dialog.open(this.agentDialog, {
      width: '400px',
      disableClose: true
    });
    this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => {
      this.controllersService.UpdateAgent(this.agentForm.value, agent.userId).subscribe(x => {
        if(x){
          this.toast.success('Agent updated successfully');
          this.GetAllAgents();
          this.dialog.closeAll();
        }
      });
      
    })
    this.isEdit = false;
  }

  deleteAgent(data: any) {
    if (confirm('Are you sure you want to delete this agent?')) {
      this.controllersService.DeleteAgent(data.id);
      this.loadData();
      this.toast.success('Agent deleted successfully');
    }
  }

  close() {
    this.dialog.closeAll();
  }

  saveAgent() {
    if (this.agentForm.valid) {
      const agentData = {
        ...this.agentForm.value,
        role: 'agent' // Explicitly setting the role to 'agent'
      };
      
     
        this.controllersService.CreateAgent(agentData).pipe().subscribe(x => {
         if(x){
         this.toast.success('Agent added successfully');
      this.closeDialog();
         }
        });
        
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
    this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => {
      this.controllersService.UpdateBranch(this.branchForm.value, Number(branch.id));
      this.toast.success('Branch updated successfully');
      this.GetAllBranches();
      this.dialog.closeAll()
    });
  }

  deleteBranch(branchId: string) {
    if (confirm('Are you sure you want to delete this branch?')) {
      this.controllersService.DeleteBranch(Number(branchId)).subscribe(res => {
        this.toast.success('Branch deleted successfully');
        this.loadData();
      });      
    }
  }

  editLender(lender: any) {
    this.isEdit = true;
    this.lenderForm.patchValue(lender);
    this.dialog.open(this.lenderDialog, {
      width: '400px',
      disableClose: true
    });
    this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => {
      this.controllersService.UpdateLender(this.lenderForm.value, Number(lender.id)).subscribe(res => {
        if(res){
          this.toast.success('Lender Updated Successfully');
          this.GetAllLenders();
        }
      })
    })
  }

  deleteLender(id: string) {
    if (confirm('Are you sure you want to delete this lender?')) {
      this.controllersService.DeleteLender(Number(id)).subscribe(res => {
        if(res){
          this.toast.success('Lender Deleted Successfully');
          this.GetAllLenders();
        }
      })
    }
  }

  editMerchant(merchant: any) {
    this.isEdit = true;
    this.merchantForm.patchValue(merchant);
    this.dialog.open(this.merchantDialog, {
      width: '400px',
      disableClose: true
    });
    this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => {
      this.controllersService.UpdateMerchant(this.merchantForm.value, Number(merchant.id)).subscribe(res => {
        if(res){
         this.toast.success('Merchant Updated Successfully')
         this.GetAllMerchants();
        }
      })
    })
  }

  deleteMerchant(merchantid: string) {
    if (confirm('Are you sure you want to delete this merchant?')) {
      this.controllersService.DeleteMerchant(Number(merchantid)).subscribe(res => {
        if(res){
          this.toast.success('Merchant deleted successfully');
          this.GetAllMerchants();
        }
      });
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
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      branch: ['', Validators.required],
      role: ['', Validators.required],
      merchantId: ['', Validators.required],
      mobile: ['', Validators.required]
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
      merchantid: ['', Validators.required],
      merchantName: ['', Validators.required],
      mobile: ['', Validators.required]
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

      this.controllersService.CreateBranch(branchData).subscribe(res => {
        if(res){
          this.toast.success('Branch Added Successfully');
          this.GetAllBranches();
          this.dialog.closeAll()
        }
      })
      // const dialogRef = this.dialog.getDialogById('branchDialog');
      // const isEdit = dialogRef?.componentInstance?.data?.isEdit;

      // if (isEdit) {
      //   this.goldLoanService.updateBranch(branchData);
      //   this.toast.success('Branch updated successfully');
      // } else {
      //   this.goldLoanService.addBranch(branchData);
      //   this.toast.success('Branch added successfully');
      // }
      // this.closeDialog();
      // this.loadData();
    }
  }

  saveLender() {
    if (this.lenderForm.valid) {
      const lenderData = this.lenderForm.value;

      this.controllersService.CreateLender(lenderData).subscribe(res => {
        if(res){
          this.toast.success("Lender Added Successfully.");
          this.GetAllLenders();
          this.dialog.closeAll()
        }
      })
      // const dialogRef = this.dialog.getDialogById('lenderDialog');
      // const isEdit = dialogRef?.componentInstance?.data?.isEdit;

      // if (isEdit) {
      //   this.goldLoanService.updateLender(lenderData);
      //   this.toast.success('Lender updated successfully');
      // } else {
      //   this.goldLoanService.addLender(lenderData);
      //   this.toast.success('Lender added successfully');
      // }
      // this.closeDialog();
      // this.loadData();
    }
  }

  saveMerchant() {
    if (this.merchantForm.valid) {
      const merchantData = this.merchantForm.value;
      // const dialogRef = this.dialog.getDialogById('merchantDialog');

      this.controllersService.CreateMerchant(merchantData).subscribe(res => {
        if(res){
          this.toast.success('Merchant Added Successfully');
          this.GetAllMerchants();
          this.dialog.closeAll();
        }
      })

      // if (isEdit) {
      //   this.goldLoanService.updateMerchant(merchantData);
      //   this.toast.success('Merchant updated successfully');
      // } else {
      //   this.goldLoanService.addMerchant(merchantData);
      //   this.toast.success('Merchant added successfully');
      // }
      this.closeDialog();
      this.loadData();
    }
  }

  GetAllBranches() {
    this.controllersService.GetAllBranches().subscribe((data: any) => {
      if(data){
        this.branches = data;
        this.filteredBranches = [...this.branches]
      }
    })
  }

  GetAllLenders() {
    this.controllersService.GetAllLenders().subscribe((data: any) => {
      if(data){
        this.lenders = data;

        this.filteredLenders = this.lenders
      }
    })
  }

  GetAllMerchants() {
    this.controllersService.GetAllMerchants().subscribe((data: any) => {
      if(data){
        this.merchants = data;
        this.filteredMerchants = this.merchants
      }
    })
  }

  GetAllAgents() {
    this.controllersService.GetAllAgents().subscribe((data: any) => {
      if(data){
        this.agents = data;
        this.filteredAgents = [...this.agents]
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
