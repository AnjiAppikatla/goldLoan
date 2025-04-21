import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule,
    MatExpansionModule
  ]
})
export class DashboardComponent {

  recentLoans = [
    {
      id: 'L1001',
      customer: 'John Smith',
      amount: '$5,200',
      goldWeight: '15g',
      date: '2025-04-15',
      status: 'active'
    }
  ]

  ngOnInit() {
    this.createPieChart();
  }


  private createPieChart() {
    const ctx = document.getElementById('goldDistributionChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['22K Gold', '24K Gold', '18K Gold'],
        datasets: [{
          data: [45, 35, 20],
          backgroundColor: [
            '#FFD700',  // Gold
            '#FFA500',  // Orange
            '#DAA520'   // Golden Rod
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}
