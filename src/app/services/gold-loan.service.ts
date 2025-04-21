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

  public loans: any[] = [];

  saveLoan(loanData: any) {
    this.loans.push(loanData);
  }

  getLoans() {
    return this.loans;
  }
}