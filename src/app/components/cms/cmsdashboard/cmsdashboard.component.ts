import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { Chart } from 'chart.js/auto';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ControllersService } from '../../../services/controllers.service';
import { ToastService } from '../../../services/toastr.service';

@Component({
  selector: 'app-cmsdashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatExpansionModule,
    ReactiveFormsModule,
    FormsModule,
    MatRadioModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './cmsdashboard.component.html',
  styleUrl: './cmsdashboard.component.scss'
})
export class CmsdashboardComponent {


  collections: any = [];
  sevenDayscollections: any = [];

  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last Week', value: 'lastweek' },
    { label: 'Last Month', value: 'lastmonth' },
    { label: 'Custom Range', value: 'custom' }
  ];

  totalCollections = 0;
  totalPayments = 0;
  totalTransfer = 0;
  netBalance = 0;
  
  selectedRange = 'today';
  customStartDate!: Date;
  customEndDate!: Date;

  merchantChart: any;
transactionChart: any;
loggedInUserRole: 'admin' | 'agent' = 'admin'; // Set based on actual login info
selectedView: 'client' | 'agent' = 'client';


   // Chart Data
   public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      }
    }
  };

  public transactionChartData = {
    labels: ['Deposits', 'Withdrawals', 'Transfers', 'Bills'],
    datasets: [{
      data: [24500, 7500, 12000, 5000],
      backgroundColor: ['#4CAF50', '#f44336', '#2196F3', '#FFC107']
    }]
  };

  public typeChartData = {
    labels: ['Cash', 'Online', 'Check'],
    datasets: [{
      data: [15000, 25000, 9000],
      backgroundColor: ['#4CAF50', '#2196F3', '#9C27B0']
    }]
  };

  agentSummary = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      transactions: 5,
      balance: 5500,
      status: 'Active',
      lastTransaction: new Date()
    },
    {
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      transactions: 3,
      balance: 12000,
      status: 'Active',
      lastTransaction: new Date()
    },
    {
      name: 'Michael Brown',
      email: 'michael@example.com',
      transactions: 1,
      balance: 6000,
      status: 'Inactive',
      lastTransaction: new Date()
    }
  ];




  constructor(
    private controllers: ControllersService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.loadCollections(this.formatDate(new Date()), this.formatDate(new Date()));
    this.LoadLast7DaysCollections();
  }



  ngAfterViewInit() {
  
    if (this.loggedInUserRole === 'agent') {
      this.selectedView = 'client';
    }
  
    this.createTransactionTypesBarChart(this.collections,this.selectedView);
  }
  
  onViewChange(newView: 'client' | 'agent') {
    this.selectedView = newView;
    this.createTransactionTypesBarChart(this.collections,newView);
  }

  createTransactionBarChart(transactions: any[]) {
    const canvas = document.getElementById('transactionsBarChart') as HTMLCanvasElement;
    if (!canvas) return;
  
    if (this.transactionChart) {
      this.transactionChart.destroy();
    }
  
    // Generate last 7 days' labels and date keys
    const last7DaysLabels: string[] = [];
    const last7DaysMap: { [date: string]: number } = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
  
      const key = date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
      last7DaysMap[key] = 0;
  
      last7DaysLabels.push(dayNames[date.getDay()]);
    }
  
    // Add data to corresponding date
    transactions.forEach(tx => {
      const rawDate = tx.created_at || tx.date;
      if (!rawDate) return;
  
      const txDate = new Date(rawDate);
      if (isNaN(txDate.getTime())) return;
  
      const dateKey = txDate.toLocaleDateString('en-CA');
      if (last7DaysMap.hasOwnProperty(dateKey)) {
        last7DaysMap[dateKey] += Number(tx.commission || 0);
      }
    });
  
    const values = Object.values(last7DaysMap);
  
    this.transactionChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: last7DaysLabels,
        datasets: [{
          label: 'Daily Commissions',
          data: values,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#C9CBCF'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => `₹${context.raw}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `₹${value}`
            }
          }
        }
      }
    });
  }
  

  createTransactionTypesBarChart(transactions: any[], viewType: 'client' | 'agent') {
    const canvas = document.getElementById('transactionTypesBarChart') as HTMLCanvasElement;
    if (!canvas) return;
  
    if (this.merchantChart) {
      this.merchantChart.destroy();
    }
  
    const grouped: { [key: string]: number } = {};
  
    transactions.forEach(entry => {
      const key = viewType === 'client' ? entry.clientName : entry.custodianName;
      const totalAmount = Number(entry.totalAmount || 0);
      if (!key) return;
  
      if (grouped[key]) {
        grouped[key] += totalAmount;
      } else {
        grouped[key] = totalAmount;
      }
    });
  
    const labels = Object.keys(grouped);
    const values = Object.values(grouped);
  
    const backgroundColors = labels.map((_, i) =>
      ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'][i % 7]
    );
  
    const maxBarThickness = labels.length === 1 ? 60 : labels.length > 5 ? 30 : 50;
  
    this.merchantChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: viewType === 'client' ? 'Client Wise Commissions' : 'Agent Wise Commissions',
          data: values,
          backgroundColor: backgroundColors,
          maxBarThickness
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => `₹${context.raw}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `₹${value}`
            }
          }
        }
      }
    });
  }
  
  onDateRangeChange(range: string) {
    const today = new Date();
    let startDate: string, endDate: string;
  
    switch (range) {
      case 'today':
        startDate = endDate = this.formatDate(today);
        break;
  
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = endDate = this.formatDate(yesterday);
        break;
  
      case 'lastweek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - 7);
        startDate = this.formatDate(lastWeekStart);
        endDate = this.formatDate(today);
        break;
  
      case 'lastmonth':
        const lastMonthStart = new Date(today);
        lastMonthStart.setMonth(today.getMonth() - 1);
        startDate = this.formatDate(lastMonthStart);
        endDate = this.formatDate(today);
        break;
  
      case 'custom':
        return; // Wait for user to apply custom range
  
      default:
        return;
    }
  
    this.loadCollections(startDate, endDate);
  }
  
  applyCustomRange() {
    if (this.customStartDate && this.customEndDate) {
      const startDate = this.formatDate(this.customStartDate);
      const endDate = this.formatDate(this.customEndDate);
      this.loadCollections(startDate, endDate);
    }
  }

  formatDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  loadCollections(startDate: string, endDate: string) {
    this.controllers.GetCollectionsByDate(startDate, endDate).subscribe({
      next: (res) => {
        this.collections = res;
        setTimeout(() => {
          this.createTransactionTypesBarChart(res,this.selectedView);
        },500)
        this.collections.map((item: any) => {
          this.totalCollections += Number(item.totalAmount);
          this.totalPayments += Number(item.payment_amount);
          this.totalTransfer += Number(item.transfer_amount);
          this.netBalance += this.totalCollections - (this.totalPayments + this.totalTransfer);
        });
      },
      error: (err) => {
        console.error('Error loading collections', err);
      }
    });
  }

  LoadLast7DaysCollections() {
    const today = new Date();
    let startDate: string, endDate: string;
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    startDate = this.formatDate(lastWeekStart);
    endDate = this.formatDate(today);

    this.controllers.GetCollectionsByDate(startDate, endDate).subscribe({
      next: (res) => {
        this.sevenDayscollections = res;
        setTimeout(() => {
          this.createTransactionBarChart(res);
        },500) // Delay for 500 milliseconds before calling createTransactionBarChar
      },
      error: (err) => {
        console.error('Error loading collections', err);
      }
    });
  }
  
  
  
  
  
  
  


}
