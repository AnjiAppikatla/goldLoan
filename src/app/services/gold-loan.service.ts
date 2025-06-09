import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ControllersService } from './controllers.service';

@Injectable({
  providedIn: 'root'
})
export class GoldLoanService {

  private loansSubject = new BehaviorSubject<any[]>([]);
  public loans$ = this.loansSubject.asObservable();

  loans: any[] = [
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
    //   totalReceivedCommission: 0,
    //   agentName: "Manikanta",
    //   agentId: 2
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
    //   totalReceivedCommission: 0,
    //   agentName: "Revathi",
    //   agentId: 3
    // }

  ];

  constructor(private controllersService: ControllersService) {}





 public cities: { branchId: string; name: string }[] = []

  lenders: any[] = [];
  merchants: any[] = [];

  getAllLoansFromLocal(){
    return this.loans;
  }

  GetAllLoans() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // e.g., 6 for June
    const currentYear = today.getFullYear();  // e.g., 2025
    this.controllersService.GetLoansByMonth(currentMonth,currentYear).subscribe({
    // this.controllersService.GetAllLoans().subscribe({
      next: (response) => {
        if (response) {
          try {
            const parsedData = typeof response === 'string' ? JSON.parse(response) : response;
            this.loans = parsedData;
            this.loans.map((loan: any) => {
              const {progress, status} = this.calculateProgress(loan);
              loan.loanProgress = progress;
              loan.status = status;
            });
            
          } catch (error) {
            console.error('Error parsing loan data:', error);
            this.loans = [];
          }
        } else {
          this.loans = [];
        }
      },
      error: (error) => {
        console.error('Error fetching loans:', error);
        this.loans = [];
        this.loansSubject.next([]);
      }
    });
  }

  saveLoan(loanData: any) {
    // Initialize commission-related fields
    // const newLoan = {
    //   ...loanData,
    //   receivedCommissions: [],
    //   totalReceivedCommission: 0,
    //   receivableCommission: parseFloat(loanData.commissionAmount) || 0
    // };
    // this.loans.push(newLoan);
    // return true; // Return success status

    this.controllersService.CreateLoan(loanData).subscribe(
      (response) => {
        console.log('Loan created successfully:', response);
        // Handle success, e.g., show a success message
      },
      (error) => {
        console.error('Error creating loan:', error);
        // Handle error, e.g., show an error message
      }
    );
  }

  // getLoans() {
  //   return this.loans;
  // }
  getBranches(){
    return this.cities;
  }

  addBranch(branchData: any) {
    const newBranch = {
      branchId: branchData.branchId,
      name: branchData.name,
      city: branchData.city
    };
    this.cities.push(newBranch);
    return true;
  }

  updateBranch(branchData: any) {
    const index = this.cities.findIndex(b => b.branchId === branchData.branchId);
    if (index !== -1) {
      this.cities[index] = {
        branchId: branchData.branchId,
        name: branchData.name
        // city: branchData.city
      };
      return true;
    }
    return false;
  }

  deleteBranch(branchId: string) {
    const index = this.cities.findIndex(b => b.branchId === branchId);
    if (index !== -1) {
      this.cities.splice(index, 1);
      return true;
    }
    return false;
  }

  // Lender operations
  addLender(lenderData: any) {
    const newLender = {
      lenderName: lenderData.name,
      id: this.lenders.length + 1,
      percentage: lenderData.commission
    };
    this.lenders.push(newLender);
    return true;
  }

  updateLender(lenderData: any) {
    const index = this.lenders.findIndex(l => l.lenderName === lenderData.name);
    if (index !== -1) {
      this.lenders[index] = {
        ...this.lenders[index],
        lenderName: lenderData.name,
        percentage: lenderData.commission
      };
      return true;
    }
    return false;
  }

  deleteLender(name: string) {
    const index = this.lenders.findIndex(l => l.lenderName === name);
    if (index !== -1) {
      this.lenders.splice(index, 1);
      return true;
    }
    return false;
  }

  // Merchant operations
  addMerchant(merchantData: any) {
    const newMerchant = {
      merchantName: merchantData.merchantName,
      merchantid: merchantData.merchantId,
      contactNumber: merchantData.contactNumber
    };
    this.merchants.push(newMerchant);
    return true;
  }

  updateMerchant(merchantData: any) {
    const index = this.merchants.findIndex(m => m.merchantid === merchantData.merchantId);
    if (index !== -1) {
      this.merchants[index] = {
        merchantName: merchantData.merchantName,
        merchantid: merchantData.merchantId,
        contactNumber: merchantData.contactNumber
      };
      return true;
    }
    return false;
  }

  deleteMerchant(merchantId: string) {
    const index = this.merchants.findIndex(m => m.merchantid === merchantId);
    if (index !== -1) {
      this.merchants.splice(index, 1);
      return true;
    }
    return false;
  }


  getMerchants(){
    return this.merchants;
  }
  updateMerchants(obj:any){
    return this.merchants.push(obj);
  }

  getLenders() {
    return this.lenders;
  }

  getCities(): any[] {
    return this.cities;
  }

  filterCities(searchTerm: string): Observable<any[]> {
    const filteredCities = this.cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filteredCities);
  }

  updateCommission(leadId: string, commissionData: any) {
    const loanIndex = this.loans.findIndex(loan => loan.leadId === leadId);
    if (loanIndex !== -1) {
      const loan = this.loans[loanIndex];
      const totalCommissionAmount = parseFloat(loan.commissionAmount);
      const newCommissionAmount = parseFloat(commissionData.received);
  
      // Check if new commission would exceed total commission
      if (newCommissionAmount > totalCommissionAmount) {
        throw new Error(`Total received commission cannot exceed ${totalCommissionAmount}`);
      }
  
      // Update the loan with new commission
      loan.receivedCommissions = [{
        receivedCommission: newCommissionAmount,
        receivedDate: new Date().toISOString()
      }];
  
      // Update totals (use the new commission amount directly, not adding to previous)
      loan.totalReceivedCommission = newCommissionAmount;
      loan.receivableCommission = totalCommissionAmount - newCommissionAmount;
  
      this.loans[loanIndex] = loan;
    }
  }


  

  


  calculateProgress(loan: any): { progress: number; status: string } {
    if (!loan.IssuedDate || !loan.MaturityDate) {
      return { progress: 0, status: 'safe' };
    }
  
    const today = new Date();
    const issuedDate = new Date(loan.IssuedDate);
    const maturityDate = new Date(loan.MaturityDate);
    
    const totalDays = maturityDate.getTime() - issuedDate.getTime();
    const daysLeft = maturityDate.getTime() - today.getTime();
    const progress = Math.min(Math.max(((totalDays - daysLeft) / totalDays) * 100, 0), 100);
  
    // Status logic determines the color transitions
    let status = 'safe';
    if (progress >= 75) {
      status = 'warning';
    }
    if (progress >= 90) {
      status = 'danger';
    }
  
    return { 
      progress: Math.round(progress * 100) / 100, 
      status: status 
    };
  }

  getProgressClass(progress: number): string {
    if (progress >= 90) return 'danger';
    if (progress >= 75) return 'warning';
    return 'safe';
  }

  getProgressTextClass(progress: number): string {
    if (progress >= 90) return 'text-red-600';
    if (progress >= 75) return 'text-yellow-600';
    return 'text-green-600';
  }

  updateLoans(loans: any[]) {
    this.loans = [...loans];
  }




}