import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { ControllersService } from '../../../services/controllers.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatDialogModule,
    MatExpansionModule,
    // NgChartsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatDatepickerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss'
})
export class WalletComponent implements OnInit {
  userRole = 'admin'; // Replace with actual auth logic
  transfers: any[] = [];
  agentWalletTotal: number = 0;
  finoWalletTotal: number = 0;

  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last Week', value: 'lastweek' },
    { label: 'Last Month', value: 'lastmonth' },
    { label: 'Custom Range', value: 'custom' }
  ];

  selectedRange = 'today';
  customStartDate!: Date;
  customEndDate!: Date;

  constructor(private controllers: ControllersService) {}

  ngOnInit() {
    this.GetAllCollections(this.formatDate(new Date()), this.formatDate(new Date()));
  }

  GetAllCollections(startDate: string, endDate: string) {
    this.controllers.GetCollectionsByDate(startDate, endDate).subscribe({
      next: (res) => {
        this.transfers = res;
        this.prepareCharts();
        this.processWalletData(res);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }



processWalletData(collections: any[]) {
  this.agentWalletTotal = 0;
  this.finoWalletTotal = 0;

  collections.forEach(item => {
    const type = item.collectionType;
    // const amount = parseFloat(item.amount || 0);

    const cashAmount = parseFloat(item.cashAmount || 0);
    const onlineAmount = parseFloat(item.onlineAmount || 0);

    switch (type) {
      case 'Cash':
        item.cashWalletTotal = this.agentWalletTotal;
        this.agentWalletTotal += cashAmount;
        break;
      case 'Online':
        item.onlineWalletTotal = this.finoWalletTotal;
        this.finoWalletTotal += onlineAmount;
        break;
      case 'cash&online':
        // const half = amount / 2;
        item.cashWalletTotal = this.agentWalletTotal;
        item.onlineWalletTotal = this.finoWalletTotal;
        this.agentWalletTotal += cashAmount;
        this.finoWalletTotal += onlineAmount;
        break;
      // case 'transfer':
        
      // case 'complete':
      //   // Skip or subtract if you're tracking net movement
      //   break;
      default:
        console.warn(`Unknown collection type: ${type}`);
    }
  });
  this.transfers = collections; 


}


prepareCharts() {
    this.prepareFinoWalletChart();
    this.prepareAgentWalletChart();
    const agentName = 'Agent A'; // Replace with actual session/token logic
    const ownTransfers = this.transfers.filter(t => t.fromAgent === agentName);
    const total = ownTransfers.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    this.renderBarChart('agentOwnWalletChart', [agentName], [total], 'My Wallet (₹)');
}

  prepareFinoWalletChart() {
    const clientWise = new Map<string, number>();
  
    this.transfers.forEach(t => {
      const client = t.clientName || 'Unknown';
      const onlineAmount = parseFloat(t.onlineAmount) || 0;
  
      if (onlineAmount > 0) {
        clientWise.set(client, (clientWise.get(client) || 0) + onlineAmount);
      }
    });
  
    const labels = Array.from(clientWise.keys());
    const data = Array.from(clientWise.values());
  
    this.renderBarChart('finoWalletChart', labels, data, 'Online Collection (₹)');
  }

  prepareAgentWalletChart() {
    const agentWise = new Map<string, number>();
  
    this.transfers.forEach(t => {
      const agent = t.custodianName || 'Unknown';
      const cashAmount = parseFloat(t.cashAmount) || 0;
  
      if (cashAmount > 0) {
        agentWise.set(agent, (agentWise.get(agent) || 0) + cashAmount);
      }
    });
  
    const labels = Array.from(agentWise.keys());
    const data = Array.from(agentWise.values());
  
    this.renderBarChart('agentWalletChart', labels, data, 'Cash Collection (₹)');
  }
  

  renderBarChart(canvasId: string, labels: string[], data: number[], label: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.warn(`Canvas with ID ${canvasId} not found`);
      return;
    }
  
    // Destroy existing chart if any
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) {
      existingChart.destroy();
    }
  
    // Use a unique color palette
    const backgroundColors = this.getUniqueColorPalette(labels.length);
  
    new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: context => `${context.label}: ₹${context.raw}`
            }
          }
        }
      }
    });
  }
  

  getRandomColor(): string {
    const colors = ['#4F46E5', '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getUniqueColorPalette(count: number): string[] {
    const baseColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#8E44AD', '#2ECC71',
      '#E67E22', '#1ABC9C', '#C0392B', '#7F8C8D',
      '#3498DB', '#F1C40F', '#9B59B6', '#D35400'
    ];
  
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }
  
    // If more colors are needed, generate random but distinct colors
    const extraColors = [];
    for (let i = 0; i < count - baseColors.length; i++) {
      extraColors.push(this.getRandomColor());
    }
  
    return baseColors.concat(extraColors);
  }
  

  formatDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
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
  
    this.GetAllCollections(startDate, endDate);
  }

  applyCustomRange() {
    if (this.customStartDate && this.customEndDate) {
      const startDate = this.formatDate(this.customStartDate);
      const endDate = this.formatDate(this.customEndDate);
      this.GetAllCollections(startDate, endDate);
    }
  }






}
