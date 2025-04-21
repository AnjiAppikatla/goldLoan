import { Injectable } from '@angular/core';

export interface Customer {
  leadId: string;
  name: string;
  mobile: string;
  merchantId: string;
  amount: number;
  branchId: string;
  city: string;
  payout70: number;
  payout30: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  public customers: Customer[] = [
    {
      leadId: '15100310',
      name: 'Aswini Degala',
      mobile: '7730087491',
      merchantId: '147224577',
      amount: 550950.00,
      branchId: '11750',
      city: 'Narasaraopet',
      payout70: 3085.32,
      payout30: 1322.28
    },
    // Add more customer data here
  ];

  getCustomers() {
    return this.customers;
  }
}