import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoldLoanService {
  private addresses: string[] = [
    'Narasaraopet, Andhra Pradesh',
    'Vizag, Andhra Pradesh',
    'Ongole, Andhra Pradesh',
    // Add more addresses
  ];

  searchAddress(term: string): Observable<string[]> {
    const filteredAddresses = this.addresses.filter(address =>
      address.toLowerCase().includes(term.toLowerCase())
    );
    return of(filteredAddresses);
  }

  public loans: any[] = [
    {
      aadharNumber: "",
      amount:20000,
      branchId:"123",
      city:"Guntur - Kothapeta",
      commission:5,
      commissionAmount:"1000.00",
      createdAt:"2025-04-23T07:43:44.509Z",
      issuedDate:"2025-04-23T07:43:29.402Z",
      leadId:"13213212",
      lender:"Bajaj",
      loanProgress: 0,
      mobileNo :"1233444444",
      maturityDate :"Sat Jun 07 2025 23:59:59 GMT+0530 (India Standard Time)",
      merchantId :"147224577",
      name :"testing",
      panNumber:"",
      receivedCommissions: [],
      totalReceivedCommission: 0,
      receivableCommission: 0
    },

  ];

  saveLoan(loanData: any) {
    this.loans.push(loanData);
  }

  getLoans() {
    return this.loans;
  }


  calculateProgress(loan: any): { progress: number; status: string } {
    if (!loan.issuedDate || !loan.maturityDate) {
      return { progress: 0, status: 'safe' };
    }

    const today = new Date();
    const issuedDate = new Date(loan.issuedDate);
    const maturityDate = new Date(loan.maturityDate);
    
    const totalDays = maturityDate.getTime() - issuedDate.getTime();
    const daysLeft = maturityDate.getTime() - today.getTime();
    const progress = Math.min(Math.max(((totalDays - daysLeft) / totalDays) * 100, 0), 100);

    return { 
      progress: Math.round(progress * 100) / 100, 
      status: this.getProgressClass(progress) 
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




}