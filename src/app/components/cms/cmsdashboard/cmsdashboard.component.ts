import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    MatRadioModule
  ],
  templateUrl: './cmsdashboard.component.html',
  styleUrl: './cmsdashboard.component.scss'
})
export class CmsdashboardComponent {

  dashboard: boolean = true;
  transactions: boolean = false;
  agentspage: boolean = false;
  addAgnet: boolean = false;
  services: boolean = false;
  collections: boolean = false;
  commissions: boolean = false;

  showSidenav: boolean = true;

  type: string = 'dashboard';

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
  ) { }

  ngOnInit() {
  }

 
  onPageChange(type: string) {
    this.dashboard = false;
    this.transactions = false;
    this.agentspage = false;
    this.addAgnet = false;
    this.services = false;
    this.collections = false;
    this.commissions = false;

    if(type == 'dashboard'){
      this.dashboard = true;
    }
    if(type == 'Payments'){
      this.transactions = true;
    }
    if(type == 'agents'){
      this.agentspage = true;
    }
    if(type == 'add-agent'){
      this.addAgnet = true;
    }
    if(type == 'services'){
      this.services = true;
    }
    if(type == 'collections'){
      this.collections = true;
    }
    if(type == 'commissions'){
      this.commissions = true;
    }

    console.log( this.dashboard,
      this.transactions,
      this.agentspage,
      this.addAgnet,
      this.services,
      this.collections,
      this.commissions,)

  }

  toggleSidenav() {
    this.showSidenav = !this.showSidenav;
  }

  ngAfterViewInit() {
    this.createTransactionBarChart();
  
    if (this.loggedInUserRole === 'agent') {
      this.selectedView = 'client';
    }
  
    this.createTransactionTypesBarChart(this.selectedView);
  }
  
  onViewChange(newView: 'client' | 'agent') {
    this.selectedView = newView;
    this.createTransactionTypesBarChart(newView);
  }

  createTransactionBarChart() {
    const canvas = document.getElementById('transactionsBarChart') as HTMLCanvasElement;
    if (!canvas) return;
  
    if (this.transactionChart) {
      this.transactionChart.destroy();
    }
  
    this.transactionChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Transactions',
          data: [12, 19, 8, 15, 10, 5, 7], // Replace with actual data
          backgroundColor: [
            '#FF6384', // Mon
            '#36A2EB', // Tue
            '#FFCE56', // Wed
            '#4BC0C0', // Thu
            '#9966FF', // Fri
            '#FF9F40', // Sat
            '#C9CBCF'  // Sun
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => `Transactions: ${context.raw}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  

  createTransactionTypesBarChart(viewType: 'client' | 'agent') {
    const canvas = document.getElementById('transactionTypesBarChart') as HTMLCanvasElement;
    if (!canvas) return;
  
    if (this.merchantChart) {
      this.merchantChart.destroy();
    }
  
    let chartData;
    let chartColors;
  
    if (viewType === 'client') {
      chartData = {
        labels: ['Client A', 'Client B', 'Client C'],
        values: [45, 25, 30]
      };
      chartColors = ['#36A2EB', '#FF6384', '#FFCE56'];
    } else {
      chartData = {
        labels: ['Agent X', 'Agent Y'],
        values: [60, 40]
      };
      chartColors = ['#4BC0C0', '#9966FF'];
    }
  
    const dataLength = chartData.values.length;
  
    // Dynamically set max bar thickness
    let maxBarThickness = 50;
    if (dataLength === 1) {
      maxBarThickness = 60; // wider if only one bar
    } else if (dataLength > 5) {
      maxBarThickness = 30; // thinner for many bars
    }
  
    this.merchantChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: viewType === 'client' ? 'Client Wise Transactions' : 'Agent Wise Transactions',
          data: chartData.values,
          backgroundColor: chartColors,
          maxBarThickness: maxBarThickness
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
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
  
  
  
  
  


}
