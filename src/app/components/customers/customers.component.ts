import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService, Customer } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule
  ],
  templateUrl: './customers.component.html'
})
export class CustomersComponent {
  customers: Customer[];

  constructor(private customerService: CustomerService) {
    this.customers = this.customerService.getCustomers();
  }
}
