import { Component, OnInit, AfterViewInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
// import { Chart } from 'chart.js/auto';
import { MatExpansionModule } from '@angular/material/expansion';
import { GoldLoanService } from '../../services/gold-loan.service';
import { AuthService } from '../../services/auth.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ControllersService } from '../../services/controllers.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { NewLoanComponent } from '../gold-loans/new-loan/new-loan.component';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {
  Chart,
  registerables
} from 'chart.js';
import { ToastService } from '../../services/toastr.service';

Chart.register(...registerables);



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
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
    MatSelectModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatRadioModule
  ]
})
export class DashboardComponent implements OnInit {
  recentLoans: any = [];
  currentUser: any = [];
  private chart: Chart | null = null;
  private timeChart: Chart | null = null;
  selectedPeriod: string = 'all';
  startDate: Date | null = null;
  endDate: Date | null = null;
  filteredLoans: any[] = [];
  AllAgents: any = [];

  merchants: any[] = [];
  selectedMerchant: string | null = null;
  merchantStats = {
    totalLoans: 0,
    totalAmount: 0
  };
  private merchantChart: Chart | null = null;

  loanForm: FormGroup;
  selectedLoan: any;
  selectedType: 'merchants' | 'lenders' = 'merchants';
  selectedLender: string | null = null;
  lenders: any[] = [];

  datefilterResult: string = '';

  @ViewChild('editLoanDialog') editLoanDialog!: TemplateRef<any>;
  


  constructor(
    private goldLoanService: GoldLoanService,
    private authService: AuthService,
    private controllers: ControllersService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.loanForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      city: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Initialize arrays
    this.recentLoans = [];
    this.merchants = [];
    this.lenders = [];
    this.AllAgents = []; 

    // Load data in sequence
    this.GetAllMerchants();
    this.GetAllLenders();
    this.GetAllAgents();
    this.GetAllLoans();

    this.getFilteredLoans();


    this.currentUser = this.authService.currentUserValue;

    // Wait for data to be loaded before creating charts
    this.initializeCharts();

    setTimeout(() => {
      this.filteredLoans = this.recentLoans
    },300)
}

private initializeCharts() {
  // Check if data is loaded
  if (this.merchants.length === 0 || this.recentLoans.length === 0) {
      setTimeout(() => this.initializeCharts(), 500);
      return;
  }

  this.createPieChart();
  this.createChart();
  this.createTimeDistributionChart();  
}


  editLoan(loan: any) {
    const dialogRef = this.dialog.open(NewLoanComponent, {
      width: '90%',
      maxWidth: '1200px',
      data: {
        isEdit: true,
        loan: loan
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.GetAllLoans(); // Refresh the list
      }
    });
  }



  onTypeChange(type: 'merchants' | 'lenders') {
    this.selectedType = type;
    this.updateChart();
  }

  onLenderChange() {
    this.filteredLoans = this.selectedLender
      ? this.recentLoans.filter((loan: any) => loan.Lender === this.selectedLender)
      : this.recentLoans;

    this.createChart();
  }

  GetAllLenders() {
    this.controllers.GetAllLenders().subscribe({
      next: (response) => {
        if (response) {
          this.lenders = response;
        }
      }
    });
  }

  downloadReport() {
    if (this.selectedType === 'merchants') {
      if (this.selectedMerchant) {
        // Download specific merchant report
        const merchant = this.merchants.find(m => m.id === this.selectedMerchant);
        const merchantLoans = this.recentLoans.filter((loan: any) => loan.MerchantId === this.selectedMerchant);
        this.downloadLoansReport(merchantLoans, `Merchant_${merchant?.name}_Report`);
      } else {
        // Download all merchants report
        const merchantWiseLoans = this.merchants.map(merchant => ({
          merchantName: merchant.name,
          loans: this.recentLoans.filter((loan: any) => loan.MerchantId === merchant.id)
        }));
        this.downloadMerchantsReport(merchantWiseLoans);
      }
    } else {
      if (this.selectedLender) {
        // Download specific lender report
        const lender = this.lenders.find(l => l.id === this.selectedLender);
        const lenderLoans = this.recentLoans.filter((loan: any) => loan.Lender === lender?.name);
        this.downloadLoansReport(lenderLoans, `Lender_${lender?.name}_Report`);
      } else {
        // Download all lenders report
        const lenderWiseLoans = this.lenders.map(lender => ({
          lenderName: lender.name,
          loans: this.recentLoans.filter((loan: any) => loan.Lender === lender.name)
        }));
        this.downloadLendersReport(lenderWiseLoans);
      }
    }
  }

  private downloadLoansReport(loans: any[], filename: string) {
    const csvData = this.convertToCSV(loans);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private downloadMerchantsReport(merchantWiseLoans: any[]) {
    const reportData = merchantWiseLoans.map(merchant => ({
      merchantName: merchant.merchantName,
      totalLoans: merchant.loans.length,
      totalAmount: merchant.loans.reduce((sum: number, loan: any) => sum + loan.Amount, 0),
      // Add more aggregated data as needed
    }));
    this.downloadLoansReport(reportData, 'All_Merchants_Report');
  }

  private downloadLendersReport(lenderWiseLoans: any[]) {
    const reportData = lenderWiseLoans.map(lender => ({
      lenderName: lender.lenderName,
      totalLoans: lender.loans.length,
      totalAmount: lender.loans.reduce((sum: number, loan: any) => sum + loan.Amount, 0),
      // Add more aggregated data as needed
    }));
    this.downloadLoansReport(reportData, 'All_Lenders_Report');
  }

  updateChart() {
    // Update chart based on selected type and value
    if (this.selectedType === 'merchants') {
      this.onMerchantChange();
    } else {
      this.onLenderChange()
    }
  }



  deleteLoan(loan: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this loan?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.controllers.DeleteLoan(Number(loan.Id)).subscribe({
          next: (response) => {
            if (response) {
              this.GetAllLoans(); // Refresh the list
            }
          }
        });
      }
    });
  }

  downloadLoan(loan: any) {
    const loanData = {
      Name: loan.Name,
      Amount: loan.Amount,
      MobileNo: loan.MobileNo,
      City: loan.City,
      IssuedDate: loan.IssuedDate,
      MaturityDate: loan.MaturityDate,
      Lender: loan.Lender,
      AgentName: loan.AgentName
    };

    const csvData = this.convertToCSV([loanData]);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan_${loan.Name}_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }


  GetAllMerchants() {
    this.controllers.GetAllMerchants().subscribe({
      next: (response) => {
        if (response) {
          this.merchants = response;
          this.createChart();
        }
      }
    });
  }

  onMerchantChange() {
    this.updateMerchantStats();
    this.createChart();
  }

  updateMerchantStats() {
    const filteredLoans = this.selectedMerchant
      ? this.recentLoans.filter((loan: any) => loan.MerchantId === this.selectedMerchant)
      : this.recentLoans;

    this.merchantStats = {
      totalLoans: filteredLoans.length,
      totalAmount: filteredLoans.reduce((sum: number, loan: any) => sum + (loan.Amount || 0), 0)
    };
  }

  async downloadData(type: 'excel' | 'pdf') {
    const filteredLoans = this.selectedType === 'merchants'
      ? (this.selectedMerchant
        ? this.recentLoans.filter((loan: any) => loan.MerchantId === this.selectedMerchant)
        : this.recentLoans)
      : (this.selectedLender
        ? this.recentLoans.filter((loan: any) => loan.Lender === this.selectedLender)
        : this.recentLoans);

    if (type === 'excel') {
      this.exportToExcel(filteredLoans);
    } else {
      await this.exportToPDF(filteredLoans);
    }
  }

  private async exportToPDF(loans: any[]) {
    const pdf = new jsPDF('landscape');
    const chartCanvas = document.getElementById('merchantDistributionChart') as HTMLCanvasElement;

    // Add title
    const title = this.selectedType === 'merchants'
      ? `Merchant Report - ${this.selectedMerchant ? this.merchants.find(m => m.merchantid === this.selectedMerchant)?.merchantName : 'All Merchants'}`
      : `Lender Report - ${this.selectedLender ? this.lenders.find(l => l.id === this.selectedLender)?.lenderName : 'All Lenders'}`;

    pdf.setFontSize(16);
    pdf.text(title, 15, 15);

    // Add chart image
    if (chartCanvas) {
      const chartImage = await html2canvas(chartCanvas);
      pdf.addImage(chartImage.toDataURL('image/png'), 'PNG', 15, 25, 120, 80);
    }

    // Add summary section
    const totalAmount = loans.reduce((sum, loan) => sum + (loan.Amount || 0), 0);
    pdf.setFontSize(12);
    pdf.text(`Total Loans: ${loans.length}`, 150, 40);
    pdf.text(`Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`, 150, 50);

    // Prepare table data with expanded information
    const tableData = loans.map(loan => [
      loan.Name,
      `₹${loan.Amount.toLocaleString('en-IN')}`,
      loan.Lender,
      this.merchants.find(m => m.merchantid === loan.MerchantId)?.merchantName || 'Unknown',
      new Date(loan.IssuedDate).toLocaleDateString(),
      new Date(loan.MaturityDate).toLocaleDateString(),
      loan.City || 'N/A',
      loan.AgentName || 'N/A',
      `${loan.progress}%`,
      loan.status || 'N/A'
    ]);

    const headers = [
      'Name',
      'Amount',
      'Lender',
      'Merchant',
      'Issue Date',
      'Maturity Date',
      'City',
      'Agent',
      'Progress',
      'Status'
    ];

    // Add the table
    autoTable(pdf, {
      head: [headers],
      body: tableData,
      startY: 110,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 99, 132] },
      columnStyles: {
        1: { halign: 'right' }, // Align amounts to the right
        8: { halign: 'center' }, // Center progress percentage
      },
      didDrawPage: (data) => {
        // Add footer
        pdf.setFontSize(8);
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          pdf.internal.pageSize.getWidth() - 60,
          pdf.internal.pageSize.getHeight() - 10
        );
      }
    });

    pdf.save(`${title}_${new Date().toISOString().split('T')[0]}.pdf`);
  }


  // private exportToExcel(loans: any[]) {
  //   const data = loans.map(loan => ({
  //     'Name': loan.Name || 'N/A',
  //     'Amount': loan.Amount || 0,
  //     'Merchant': this.merchants.find(m => m.merchantId === loan.MerchantId)?.merchantName || 'N/A',
  //     'Lender': this.lenders.find((l:any) => l.lenderId === loan.LenderId)?.lenderName || 'N/A',
  //     'Mobile': loan.MobileNo || 'N/A',
  //     'City': loan.City || 'N/A',
  //     'Agent Name': loan.AgentName || 'N/A',
  //     'Issue Date': loan.IssuedDate ? new Date(loan.IssuedDate).toLocaleDateString() : 'N/A',
  //     'Maturity Date': loan.MaturityDate ? new Date(loan.MaturityDate).toLocaleDateString() : 'N/A',
  //     'Status': this.goldLoanService.calculateProgress(loan).status || 'N/A',
  //     'Commission Amount': loan.CommissionAmount || 0,
  //     'Commission Status': loan.CommissionStatus || 'N/A',
  //     'Payment Type': loan.PaymentType || 'N/A',
  //     'Online Payment Type': loan.OnlinePaymentType || 'N/A',
  //     'Received By': loan.ReceivedBy || 'N/A'
  //   }));

  //   const ws = XLSX.utils.json_to_sheet(data);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Loans');

  //   const title = this.selectedType === 'merchants'
  //     ? `Merchant_${this.selectedMerchant ? this.merchants.find(m => m.merchantid === this.selectedMerchant)?.merchantName : 'All'}`
  //     : `Lender_${this.selectedLender ? this.lenders.find(l => l.id === this.selectedLender)?.lenderName : 'All'}`;

  //   XLSX.writeFile(wb, `${title}_${new Date().toISOString().split('T')[0]}.xlsx`);
  // }

  private exportToExcel(data: any[]) {
    try {
      // Format data based on selected filter
      const formattedData = data.map(loan => ({
        'Name': loan.Name || 'N/A',
        'Amount': loan.Amount || 0,
        'Merchant': this.merchants.find(m => m.merchantId === loan.MerchantId)?.merchantName || 'N/A',
        'Lender': this.lenders.find((l:any) => l.lenderId === loan.LenderId)?.lenderName || 'N/A',
        'Mobile': loan.MobileNo || 'N/A',
        'City': loan.City || 'N/A',
        'Agent Name': loan.AgentName || 'N/A',
        'Issue Date': loan.IssuedDate ? new Date(loan.IssuedDate).toLocaleDateString() : 'N/A',
        'Maturity Date': loan.MaturityDate ? new Date(loan.MaturityDate).toLocaleDateString() : 'N/A',
        'Status': this.goldLoanService.calculateProgress(loan).status || 'N/A',
        'Commission Amount': loan.CommissionAmount || 0,
        'Commission Status': loan.CommissionStatus || 'N/A',
        'Payment Type': loan.PaymentType || 'N/A',
        'Online Payment Type': loan.OnlinePaymentType || 'N/A',
        'Received By': loan.ReceivedBy || 'N/A'
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Loans');
  
      const fileName = `Loans_Report_${this.getFilterName()}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      this.toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.toast.error('Failed to download Excel file');
    }
  }

    private getFilterName() {
      if (!this.selectedType) return 'All';
      
      if (this.selectedType !== 'merchants') {
        const lender = this.lenders.find((l:any) => l.lenderName === this.selectedType);
        return lender ? lender.lenderName : 'Unknown_Lender';
      } else {
        const merchant = this.merchants.find(m => m.merchantid === this.selectedType);
        return merchant ? merchant.merchantName : 'Unknown_Merchant';
      }
    }


  createChart() {
    if (this.merchantChart) {
      this.merchantChart.destroy();
    }
    const canvas = document.getElementById('merchantDistributionChart') as HTMLCanvasElement;
    if (!canvas) {
      setTimeout(() => this.createChart(), 100);
      return;
    }

    const chartData = this.selectedType === 'merchants'
      ? this.calculateMerchantDistribution()
      : this.calculateLenderDistribution();

      console.log( "chartData" ,chartData)

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
    ];

    this.merchantChart = new Chart(canvas, {
      type: 'pie',
      data: {
          labels: chartData.labels,
          datasets: [{
              data: chartData.values,
              backgroundColor: colors,
              borderWidth: 1,
              borderColor: '#fff'
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: true,  // Allow custom dimensions
          layout: {
              padding: {
                  left: 0,
                  right: 0,  // Space for legend
                  top: 0,
                  bottom: 0
              }
          },
          plugins: {
              legend: {
                  position: 'bottom',
                  align: 'center',
                  labels: {
                      color: '#333',
                      padding: 10,
                      boxWidth: 15,
                      boxHeight: 15
                  }
              },
              tooltip: {
                  callbacks: {
                      label: (context) => {
                          const value = context.raw as number;
                          return `${context.label}: ₹${value.toLocaleString('en-IN')}`;
                      }
                  }
              }
          },
          animation: {
              duration: 800,
              easing: 'easeInOutQuart',
              animateRotate: true,
              animateScale: true
          }
      }
  });
    
  }

  getFilteredLoans() {
    let filteredLoans = [...this.recentLoans];

   

    // Apply merchant/lender filter
    if (this.selectedMerchant) {
      if (this.selectedMerchant == 'merchant') {
        filteredLoans = filteredLoans.filter(loan => loan.MerchantId === this.selectedMerchant);
      } else {
        filteredLoans = filteredLoans.filter(loan => loan.LenderId === this.selectedMerchant);
      }
    }

    return filteredLoans;
  }

  calculateMerchantDistribution() {
    const merchantData = new Map<string, { count: number, amount: number }>();
    const filteredLoans = this.recentLoans;

    // First ensure all merchants are initialized with zero values
    this.merchants.forEach(merchant => {
        merchantData.set(merchant.merchantName, { count: 0, amount: 0 });
    });

    // Then aggregate loan data
    filteredLoans.forEach((loan:any) => {
        const merchant = this.merchants.find(m => m.merchantid === loan.MerchantId);
        if (merchant) {
            const merchantName = merchant.merchantName;
            const currentData = merchantData.get(merchantName) || { count: 0, amount: 0 };
            merchantData.set(merchantName, {
                count: currentData.count + 1,
                amount: currentData.amount + (parseFloat(loan.Amount) || 0)
            });
        }
    });

    // Filter out merchants with zero amounts and sort by amount
    const sortedData = Array.from(merchantData.entries())
        .filter(([_, data]) => data.amount > 0)
        .sort(([_, a], [__, b]) => b.amount - a.amount);

    return {
        labels: sortedData.map(([name, _]) => name),
        values: sortedData.map(([_, data]) => data.amount)
    };
}

  private calculateLenderDistribution() {
    const lenderData = new Map<string, { count: number, amount: number }>();

    let filteredLoans = this.getFilteredLoans();

    filteredLoans.forEach(loan => {
      const lender = this.lenders.find((l: any) => l.lenderName === loan.Lender);
      const lenderName = lender?.lenderName || 'Unknown';
      const currentData = lenderData.get(lenderName) || { count: 0, amount: 0 };
      lenderData.set(lenderName, {
        count: currentData.count + 1,
        amount: currentData.amount + (parseFloat(loan.Amount) || 0)
      });
    });

    return {
      labels: Array.from(lenderData.keys()),
      values: Array.from(lenderData.values()).map(data => data.amount)
    };
  }
  
  


  downloadMerchantReport() {
    const filteredLoans = this.selectedMerchant
      ? this.recentLoans.filter((loan: any) => loan.MerchantId === this.selectedMerchant)
      : this.recentLoans;

    const csvData = this.convertToCSV(filteredLoans);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merchant_report_${this.selectedMerchant || 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(loans: any[]) {
    const headers = ['Name', 'Lender', 'Amount', 'IssuedDate', 'MaturityDate', 'City', 'AgentName'];
    const rows = loans.map(loan => [
      loan.Name,
      loan.Lender,
      loan.Amount,
      loan.IssuedDate,
      loan.MaturityDate,
      loan.City,
      loan.AgentName
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  GetAllLoans() {
    this.recentLoans = [];
    this.controllers.GetAllLoans().subscribe({
      next: (response) => {
        if (response) {
          this.recentLoans = response;

          this.recentLoans.map((loan: any) => {
            const { progress, status } = this.goldLoanService.calculateProgress(loan);
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
        const agents = this.AllAgents;
        if (!agents || agents.length === 0) {
            console.warn('No agents found');
            return;
        }

        // Calculate loans per agent without filtering out zero loans
        const agentLoans = agents
            .filter((agent: any) => agent && agent.name) // Only filter invalid agents
            .map((agent: any) => {
                const loans = this.recentLoans;
                const agentLoans = loans ? loans.filter(
                    (loan: any) => loan && loan.AgentName === agent.name
                ) : [];

                return {
                    name: agent.name,
                    loanCount: agentLoans.length
                };
            });

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
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 0,
                            boxWidth: 12,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const dataset = context.dataset;
                                const total = dataset.data.reduce((sum: number, val: number) => sum + (val || 0), 0);
                                const value = context.raw as number;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                return `${context.label}: ${value} loans (${percentage}%)`;
                            }
                        },
                    },
                    
                },
                animation: {
                  duration: 800,
                  easing: 'easeInOutQuart',
                  animateRotate: true,
                  animateScale: true
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

      loans.forEach((loan: any) => {
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    var loans = [...this.recentLoans]

    if (this.selectedPeriod === 'all') {
      this.GetAllLoans();

      setTimeout(() => {
        this.filteredLoans = this.recentLoans;
      },100)
    }
  
    if (this.selectedPeriod === 'today') {
        loans = loans.filter(loan => {
        const loanDate = new Date(loan.IssuedDate);
        loanDate.setHours(0, 0, 0, 0);
        return loanDate.getTime() === today.getTime();
      });
    } 
    else if (this.selectedPeriod === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
  
      loans = loans.filter(loan => {
        const loanDate = new Date(loan.IssuedDate);
        loanDate.setHours(0, 0, 0, 0);
        return loanDate.getTime() === yesterday.getTime();
      });
    } 
    else if (this.selectedPeriod === 'last-week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      oneWeekAgo.setHours(0, 0, 0, 0);
  
      loans = loans.filter(loan => {
        const loanDate = new Date(loan.IssuedDate);
        return loanDate >= oneWeekAgo && loanDate <= today;
      });
    } 
    else if (this.selectedPeriod === 'last-month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(today.getMonth() - 1);
      oneMonthAgo.setHours(0, 0, 0, 0);
  
      loans = loans.filter(loan => {
        const loanDate = new Date(loan.IssuedDate);
        return loanDate >= oneMonthAgo && loanDate <= today;
      });
    }

    if(loans.length > 0){
      this.filteredLoans = loans
    }
    else{
      this.filteredLoans = []
      this.datefilterResult = `${this.selectedPeriod} loans not found`;
      this.toast.error(`${this.selectedPeriod} loans not found`)
    }

    setTimeout(() => {
      this.createChart();
    this.createTimeDistributionChart();
    this.createPieChart();
    },500)

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