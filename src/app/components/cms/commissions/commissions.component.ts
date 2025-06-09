import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
// import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatChipsModule } from '@angular/material/chips';

interface Commission {
  collectedFrom: string;
  collectedBy: string;
  amount: number;
  commissionPercentage: number;
  date: Date;
  status: 'Paid' | 'Pending';
  reference: string;
}

@Component({
  selector: 'app-commissions',
  standalone: true,
  imports: [
    CommonModule, 
    MatExpansionModule, 
    MatCardModule,
    MatChipsModule
    // NgChartsModule
  ],
  templateUrl: './commissions.component.html',
  styleUrl: './commissions.component.scss'
})
export class CommissionsComponent implements OnInit {
  commissions: Commission[] = [
    {
      collectedFrom: 'John Smith',
      collectedBy: 'Agent Mike',
      amount: 5000,
      commissionPercentage: 10,
      date: new Date(),
      status: 'Paid',
      reference: 'COM-001'
    },
    {
      collectedFrom: 'Sarah Johnson',
      collectedBy: 'Agent Lisa',
      amount: 3500,
      commissionPercentage: 8,
      date: new Date(),
      status: 'Pending',
      reference: 'COM-002'
    },
    {
      collectedFrom: 'Robert Brown',
      collectedBy: 'Agent Tom',
      amount: 2500,
      commissionPercentage: 12,
      date: new Date(),
      status: 'Paid',
      reference: 'COM-003'
    }
  ];

  getTotalCommission(): number {
    return this.commissions.reduce((sum, commission) => 
      sum + (commission.amount * commission.commissionPercentage / 100), 0);
  }

  getCommissionAmount(commission: Commission): number {
    return commission.amount * commission.commissionPercentage / 100;
  }

  public agentPieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107']
    }]
  };

  public totalPieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#E91E63', '#9C27B0', '#3F51B5']
    }]
  };

  public statusPieChartData: ChartData<'pie'> = {
    labels: ['Paid', 'Pending'],
    datasets: [{
      data: [],
      backgroundColor: ['#4CAF50', '#FFC107']
    }]
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            return `${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          }
        }
      }
    }
  };

  ngOnInit() {
    this.updateAllCharts();
  }

  private updateAllCharts() {
    this.updateAgentPieChart();
    this.updateTotalPieChart();
    this.updateStatusPieChart();
  }

  private updateAgentPieChart() {
    const agentCommissions = new Map<string, number>();
    
    this.commissions.forEach(commission => {
      const amount = this.getCommissionAmount(commission);
      const current = agentCommissions.get(commission.collectedBy) || 0;
      agentCommissions.set(commission.collectedBy, current + amount);
    });

    this.agentPieChartData.labels = Array.from(agentCommissions.keys());
    this.agentPieChartData.datasets[0].data = Array.from(agentCommissions.values());
  }

  private updateTotalPieChart() {
    const totalByType = new Map<string, number>();
    
    this.commissions.forEach(commission => {
      const current = totalByType.get(commission.collectedFrom) || 0;
      totalByType.set(commission.collectedFrom, current + commission.amount);
    });

    this.totalPieChartData.labels = Array.from(totalByType.keys());
    this.totalPieChartData.datasets[0].data = Array.from(totalByType.values());
  }

  private updateStatusPieChart() {
    const paid = this.commissions
      .filter(c => c.status === 'Paid')
      .reduce((sum, c) => sum + this.getCommissionAmount(c), 0);
    
    const pending = this.commissions
      .filter(c => c.status === 'Pending')
      .reduce((sum, c) => sum + this.getCommissionAmount(c), 0);

    this.statusPieChartData.datasets[0].data = [paid, pending];
  }
}
