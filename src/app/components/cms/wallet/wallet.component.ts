import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ControllersService } from '../../../services/controllers.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [FormsModule, CommonModule,MatExpansionModule,MatCardModule],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss'
})
export class WalletComponent implements OnInit {
  userRole = 'admin'; // Replace with actual auth logic
  transfers: any[] = [];
  agentWalletTotal: number = 0;
  finoWalletTotal: number = 0;

  constructor(private controllers: ControllersService) {}

  ngOnInit() {
    this.GetAllCollections();
  }

  GetAllCollections() {
    this.controllers.getAllCollections().subscribe({
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
    if (this.userRole === 'admin') {
      this.prepareFinoWalletChart();
      this.prepareAgentWalletChart();
    } else {
      const agentName = 'Agent A'; // Replace with actual session/token logic
      const ownTransfers = this.transfers.filter(t => t.fromAgent === agentName);
      const total = ownTransfers.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
      this.renderBarChart('agentOwnWalletChart', [agentName], [total], 'My Wallet (₹)');
    }
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

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: labels.map(() => this.getRandomColor()),
          barThickness: 30, // 👈 controls bar width (you can make it smaller like 10 or 15)
        maxBarThickness: 35 // 👈 max allowed width
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => `₹${val}`
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: context => `₹${context.raw}`
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
}
