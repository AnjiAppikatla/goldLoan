import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { MatExpansionModule } from '@angular/material/expansion';
import { GoldLoanService } from '../../services/gold-loan.service';
import { AuthService } from '../../services/auth.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ControllersService } from '../../services/controllers.service';

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
    MatExpansionModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatSelectModule
  ]
})
export class DashboardComponent implements OnInit {
  recentLoans: any = [];
  currentUser: any = [];
  private chart: Chart | null = null;
  private timeChart: Chart | null = null;
  selectedPeriod: string = 'month';
  startDate: Date | null = null;
  endDate: Date | null = null;
  filteredLoans: any[] = [];
  AllAgents: any = [];
  constructor(
    private goldLoanService: GoldLoanService,
    private authService: AuthService,
    private controllers: ControllersService
  ) { }

  ngOnInit() {
    this.GetAllLoans();
    this.GetAllAgents();

    // this.recentLoans = this.recentLoans.map((loan: any) => ({
    //   ...loan,
    //   progress: this.goldLoanService.calculateProgress(loan)
    // }));

    this.currentUser = this.authService.currentUserValue;
    setTimeout(() => {
      this.createPieChart();
      this.createTimeDistributionChart();
    }, 1000);
  
  }

  GetAllLoans() {
    this.recentLoans = [];
    this.controllers.GetAllLoans().subscribe({
      next: (response) => {
        if (response) {
          this.recentLoans = response;

         this.recentLoans.map((loan: any) => {
           const {progress, status} = this.goldLoanService.calculateProgress(loan);
           loan.progress = progress;
           loan.status = status;
         });
        }
      }
    })
  }

  GetAllAgents() {
    this.AllAgents = []; // Clear the array before fetc
    this.controllers.GetAllAgents().subscribe({
      next: (response) => {
        if (response) {
          this.AllAgents = response;
        }
      }
    })
  }





  private createPieChart() {
    try {
        // Use AllAgents instead of authService.getAllAgents()
        const agents = this.AllAgents;
        if (!agents || agents.length === 0) {
            console.warn('No agents found');
            return;
        }

        // Calculate loans per agent
        const agentLoans = agents
            .filter((agent: any) => agent && agent.name) // Check for name
            .map((agent: any) => {
                const loans = this.recentLoans;
                const agentLoans = loans ? loans.filter(
                    (loan: any) => loan && loan.AgentName === agent.name // Match by name
                ) : [];

                return {
                    name: agent.name,
                    loanCount: agentLoans.length
                };
            })
            .filter((data:any) => data.loanCount > 0); // Only include agents with loans

        if (agentLoans.length === 0) {
            console.warn('No loan data to display');
            return;
        }

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        const canvas = document.getElementById('goldDistributionChart');
        if (!canvas) {
            console.error('Chart canvas element not found');
            return;
        }

        this.chart = new Chart(canvas as HTMLCanvasElement, {
            type: 'pie',
            data: {
                labels: agentLoans.map((agent:any) => agent.name),
                datasets: [{
                    data: agentLoans.map((agent:any) => agent.loanCount),
                    backgroundColor: [
                        '#4CAF50',  // Green
                        '#2196F3',  // Blue
                        '#FFC107',  // Amber
                        '#FF5722',  // Deep Orange
                        '#9C27B0'   // Purple
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            boxWidth: 12,
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating pie chart:', error);
    }
}

private createTimeDistributionChart() {
    try {
      const loans = this.recentLoans;
      const now = new Date();
      const yesterday = new Date(now.setDate(now.getDate() - 1));
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

      const timeDistribution = {
        today: 0,
        yesterday: 0,
        lastWeek: 0,
        lastMonth: 0,
        older: 0
      };

      loans.forEach((loan:any) => {
        const loanDate = new Date(loan.IssuedDate);
        if (loanDate.toDateString() === new Date().toDateString()) {
          timeDistribution.today++;
        } else if (loanDate.toDateString() === yesterday.toDateString()) {
          timeDistribution.yesterday++;
        } else if (loanDate >= lastWeek) {
          timeDistribution.lastWeek++;
        } else if (loanDate >= lastMonth) {
          timeDistribution.lastMonth++;
        } else {
          timeDistribution.older++;
        }
      });

      // Destroy existing chart if it exists
      if (this.timeChart) {
        this.timeChart.destroy();
      }

      const canvas = document.getElementById('timeDistributionChart') as HTMLCanvasElement;
      if (!canvas) return;

      this.timeChart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: ['Today', 'Yesterday', 'Last Week', 'Last Month', 'Older'],
          datasets: [{
            data: [
              timeDistribution.today,
              timeDistribution.yesterday,
              timeDistribution.lastWeek,
              timeDistribution.lastMonth,
              timeDistribution.older
            ],
            backgroundColor: [
              '#10B981',  // Emerald
              '#3B82F6',  // Blue
              '#F59E0B',  // Amber
              '#EF4444',  // Red
              '#6B7280'   // Gray
            ]
          }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            layout: {
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        boxWidth: 12,
                        font: {
                            size: 11
                        }
                    }
                },
                title: {
                    display: false,
                    text: 'Loan Distribution by Time',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                }
            }
        }
      });
    } catch (error) {
      console.error('Error creating time distribution chart:', error);
    }
  }

  onPeriodChange() {
    if (this.selectedPeriod !== 'custom') {
      this.filterLoans();
    }
  }

  onDateChange() {
    if (this.startDate && this.endDate) {
      this.filterLoans();
    }
  }

  private filterLoans() {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now.setHours(23, 59, 59, 999));

    switch (this.selectedPeriod) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'yesterday':
        startDate = new Date(now.setDate(now.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'custom':
        if (this.startDate && this.endDate) {
          startDate = new Date(this.startDate);
          endDate = new Date(this.endDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return;
        }
        break;
      default:
        startDate = new Date(0); // All time
    }

    this.filteredLoans = this.recentLoans.filter((loan: any) => {
      const loanDate = new Date(loan.issuedDate);
      return loanDate >= startDate && loanDate <= endDate;
    });

    this.createPieChart();
    this.createTimeDistributionChart();
  }





}