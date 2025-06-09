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
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  today = new Date();

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
    // Get the selected lender's name from the lenders array
    const selectedLenderName = this.selectedLender
        ? this.lenders.find(l => l.id === this.selectedLender)?.lenderName
        : null;

    this.filteredLoans = selectedLenderName
        ? this.recentLoans.filter((loan: any) => loan.Lender === selectedLenderName)
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
    // Clear previous selection when switching types
    if (this.selectedType === 'merchants') {
        this.selectedLender = null;
    } else {
        this.selectedMerchant = null;
    }
    
    // Reset filtered loans to all loans when switching types
    this.filteredLoans = this.recentLoans;
    this.createChart();
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

  async downloadLoan(loan: any, type: 'excel' | 'pdf') {
    if (type === 'excel') {
        this.exportToExcel([loan]);
    } else {
        await this.exportToPDF([loan]);
    }
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
    this.filteredLoans = this.selectedMerchant
        ? this.recentLoans.filter((loan: any) => loan.MerchantId === this.selectedMerchant)
        : this.recentLoans;

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
    let filteredLoans;
    
    if (this.selectedType === 'merchants') {
        const selectedMerchantName = this.merchants.find(m => m.merchantid === this.selectedMerchant)?.merchantName;
        filteredLoans = this.selectedMerchant
            ? this.recentLoans.filter((loan: any) => loan.MerchantId === this.selectedMerchant)
            : this.recentLoans;
    } else {
        const selectedLenderName = this.lenders.find(l => l.id === this.selectedLender)?.lenderName;
        filteredLoans = this.selectedLender
            ? this.recentLoans.filter((loan: any) => loan.Lender === selectedLenderName)
            : this.recentLoans;
    }

    if (type === 'excel') {
        this.exportToExcel(filteredLoans);
    } else {
        await this.exportToPDF(filteredLoans);
    }
}

private async exportToPDF(loans: any[]): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  const chartCanvas = document.getElementById('merchantDistributionChart') as HTMLCanvasElement;

  // Generate Title
  const title = loans.length === 1
    ? `Loan Details - ${loans[0].Name}`
    : this.selectedType === 'merchants'
      ? `Merchant Report - ${this.selectedMerchant ? this.merchants.find(m => m.merchantid === this.selectedMerchant)?.merchantName : 'All Merchants'}`
      : `Lender Report - ${this.selectedLender ? this.lenders.find(l => l.id === this.selectedLender)?.lenderName : 'All Lenders'}`;

  pdf.setFontSize(16);
  const titleWidth = pdf.getStringUnitWidth(title) * 16 / pdf.internal.scaleFactor;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const titleX = (pageWidth - titleWidth) / 2;
  pdf.text(title, titleX, 15);

  let startY = 25;

  // Insert Chart (if exists and multiple loans)
  if (chartCanvas && loans.length > 1) {
    const canvasImage = await html2canvas(chartCanvas);
    const imgData = canvasImage.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = 80; // Reduced chart size
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    // Add chart
    pdf.addImage(imgData, 'PNG', 20, startY, imgWidth, imgHeight);

    // Add summary to the right of the chart
    if (loans.length > 1) {
      const totalAmount = loans.reduce((sum, loan) => sum + (Number(loan.Amount) || 0), 0);
      pdf.setFontSize(12);
      pdf.text(`Total Loans : ${loans.length}`, imgWidth + 25, startY + 10);
      pdf.text(
        `Total Amount : ${totalAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        imgWidth + 25,
        startY + 20
      );
    }

    startY += imgHeight + 15; // Added more spacing after chart
  }

  // const isAdmin = this.currentUser?.role === 'admin';

  // Table Headers and Body remain the same
  const headers = [
    ['Name', 'Amount', 'Lender', 'Lead Id', 'Merchant', 'Issue Date', 'Maturity Date', 'City', 'Agent']
    // 'Commission Amount', 'Commission Received','Receivable Commission','Commission Percentage'
  ];

  const tableData = loans.map(loan => ([
    loan.Name || 'N/A',
    `${loan.Amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    loan.Lender || 'N/A',
    loan.LeadId || 'N/A',
    this.merchants.find(m => m.merchantid === loan.MerchantId)?.merchantName || 'N/A',
    loan.IssuedDate ? new Date(loan.IssuedDate).toLocaleDateString() : 'N/A',
    loan.MaturityDate ? new Date(loan.MaturityDate).toLocaleDateString() : 'N/A',
    loan.City || 'N/A',
    loan.AgentName || 'N/A'
    // isAdmin ? loan.CommissionAmount :  '-',
    // isAdmin ? this.CalCForXl(loan) : '-',
    // isAdmin ? loan.CommissionAmount - this.CalCForXl(loan.CommissionReceived) : '-',
    // isAdmin ? loan.CommissionPercentage : '-'
  ]));

  autoTable(pdf, {
    head: headers,
    body: tableData,
    startY: startY,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left'
    },
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    didDrawPage: () => {
      pdf.setFontSize(8);
      const timestamp = `Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      const timestampWidth = pdf.getStringUnitWidth(timestamp) * 8 / pdf.internal.scaleFactor;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const timestampX = pageWidth - timestampWidth - 10;
      pdf.text(timestamp, timestampX, pdf.internal.pageSize.getHeight() - 10);
    }
  });

  const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}


formatIndianAmount(amount: number): string {
  const parts = amount.toFixed(2).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian format with commas (lakhs/crores)
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherNumbers ? "," : "") + lastThree;

  return "₹" + formattedInteger + "." + decimalPart;
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

  CalCForXl(loan:any){
    let existingCommissions: any[] = [];
    try {
      if (loan.CommissionReceived) {
        const parsed = JSON.parse(loan.CommissionReceived);
        existingCommissions = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch (e) {
      console.error('Error parsing commission data:', e);
      existingCommissions = [];
    }
  
    // Calculate total already received
    const totalReceived = existingCommissions.reduce((sum, entry) =>
      sum + (parseFloat(entry.received) || 0), 0);
  
    return totalReceived;
  }

  private exportToExcel(loans: any[]) {
    const isAdmin = this.currentUser?.role === 'admin';
    try {
      const formattedData = loans.map(loan => ({
        'Name': loan.Name || 'N/A',
        'Amount': loan.Amount || 0,
        'Merchant': this.merchants.find(m => m.merchantid === loan.MerchantId)?.merchantName || 'N/A',
        'Lender': loan.Lender || 'N/A',
        'Lead Id': loan.LeadId || 'N/A',
        'Mobile': loan.MobileNo || 'N/A',
        'City': loan.City || 'N/A',
        'Agent Name': loan.AgentName || 'N/A',
        'Issue Date': loan.IssuedDate ? new Date(loan.IssuedDate).toLocaleDateString() : 'N/A',
        'Maturity Date': loan.MaturityDate ? new Date(loan.MaturityDate).toLocaleDateString() : 'N/A',
        'Payment Type': loan.PaymentType || '-',
        'Cash Amount': loan.CashAmount || '-',
        'Online Amount': loan.OnlineAmount || '-',
        'Online Payment Type': loan.OnlinePaymentType || '-',
        'Received By': loan.ReceivedBy || '-',
        'Commission Amount': isAdmin ? loan.CommissionAmount :  '-',
      'Commission Received': isAdmin ? this.CalCForXl(loan) : '-',
      'Receivable Commission': isAdmin ? loan.CommissionAmount - this.CalCForXl(loan.CommissionReceived) : '-',
      'Commission Percentage': isAdmin ? loan.CommissionPercentage : '-'
      }));

      const totalAmount = loans.reduce((sum, loan) => sum + (Number(loan.Amount) || 0), 0);
    formattedData.push({'Name': '',
      'Amount': '',
      'Merchant': '',
      'Lender': '',
      'Lead Id': '',
      'Mobile': '',
      'City': '',
      'Agent Name': '',
      'Issue Date': '',
      'Maturity Date': '',
      'Payment Type': '',
      'Cash Amount': '',
      'Online Amount': '',
      'Online Payment Type': '',
      'Received By': '',
      'Commission Amount': '',
      'Commission Received': '',
      'Receivable Commission': '',
      'Commission Percentage': ''
    }); // Empty row
    formattedData.push({
      'Name': 'Total Amount : ',
      'Amount': totalAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      'Merchant': '',
      'Lender': '',
      'Lead Id': '',
      'Mobile': '',
      'City': '',
      'Agent Name': '',
      'Issue Date': '',
      'Maturity Date': '',
      'Payment Type': '',
      'Cash Amount': '',
      'Online Amount': '',
      'Online Payment Type': '',
      'Received By': '',
      'Commission Amount': '',
      'Commission Received': '',
      'Receivable Commission': '',
      'Commission Percentage': ''
    });
  
      const ws = XLSX.utils.json_to_sheet(formattedData);
  
      // ✅ Set column widths automatically
      const columnWidths = Object.keys(formattedData[0]).map((key) => {
        const maxLength = Math.max(
          key.length,
          ...formattedData.map(row => (row as any)[key]?.toString().length || 0)
        );
        return { wch: maxLength + 2 }; // Add some padding
      });
      ws['!cols'] = columnWidths;
  
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Loans');
  
      const title = loans.length === 1
        ? `Loan_${loans[0].Name}`
        : this.selectedType === 'merchants'
          ? `Merchant_${this.selectedMerchant ? this.merchants.find(m => m.merchantid === this.selectedMerchant)?.merchantName : 'All'}`
          : `Lender_${this.selectedLender ? loans[0].Lender : 'All'}`;
  
      XLSX.writeFile(wb, `${title}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
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
  
      const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
      ];
  
      // Format labels to include loan count
      const formattedLabels = chartData.labels.map((label, index) => {
          const count = this.selectedType === 'merchants'
              ? this.recentLoans.filter((loan:any) => this.merchants.find(m => m.merchantName === label)?.merchantid === loan.MerchantId).length
              : this.recentLoans.filter((loan:any) => loan.Lender === label).length;
          return `${label} (${count})`;
      });
  
      this.merchantChart = new Chart(canvas, {
          type: 'pie',
          data: {
              labels: formattedLabels,
              datasets: [{
                  data: chartData.values,
                  backgroundColor: colors,
                  borderWidth: 1,
                  borderColor: '#fff'
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: true,
              layout: {
                  padding: {
                      left: 0,
                      right: 0,
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
                          boxHeight: 15,
                          font: {
                              size: 11 // Smaller font size for legend
                          }
                      }
                  },
                  tooltip: {
                      callbacks: {
                          label: (context) => {
                              const value = context.raw as number;
                              return `Amount: ₹${value.toLocaleString('en-IN')}`;
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
    // Filter loans based on selected merchant
    const filteredLoans = this.selectedMerchant
        ? this.recentLoans.filter((loan:any) => loan.MerchantId === this.selectedMerchant)
        : this.recentLoans;

    // First ensure all merchants are initialized with zero values
    this.merchants.forEach(merchant => {
        // Only initialize selected merchant or all merchants if none selected
        if (!this.selectedMerchant || merchant.merchantid === this.selectedMerchant) {
            merchantData.set(merchant.merchantName, { count: 0, amount: 0 });
        }
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

  // Filter loans based on selected lender
  const filteredLoans = this.selectedLender
      ? this.recentLoans.filter((loan:any) => loan.Lender === this.lenders.find(l => l.id === this.selectedLender)?.lenderName)
      : this.recentLoans;

  // Aggregate loan data directly from loans instead of initializing all lenders
  filteredLoans.forEach((loan:any) => {
      if (loan.Lender) {
          const currentData = lenderData.get(loan.Lender) || { count: 0, amount: 0 };
          lenderData.set(loan.Lender, {
              count: currentData.count + 1,
              amount: currentData.amount + (parseFloat(loan.Amount) || 0)
          });
      }
  });

  // Sort by amount
  const sortedData = Array.from(lenderData.entries())
      .sort(([_, a], [__, b]) => b.amount - a.amount);

  return {
      labels: sortedData.map(([name, _]) => name),
      values: sortedData.map(([_, data]) => data.amount)
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
    this.filteredLoans = [];
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // e.g., 6 for June
    const currentYear = today.getFullYear();  // e.g., 2025
    // this.controllers.GetAllLoans().subscribe({
    this.controllers.GetLoansByMonth(currentMonth,currentYear).subscribe({
      next: (response) => {
        if (response) {
          this.recentLoans = response;

          this.recentLoans = this.recentLoans.map((loan:any) => ({
            ...loan,
            ReceivedDate: loan.ReceivedDate == '0000-00-00 00:00:00' ? '' : loan.ReceivedDate
          }));

          this.recentLoans = [...this.recentLoans].reverse(); // Reverse the array here

          this.recentLoans.map((loan: any) => {
            const { progress, status } = this.goldLoanService.calculateProgress(loan);
            loan.progress = progress;
            loan.status = status;
            loan.ReceivedDate == '0000-00-00 00:00:00' ? '' : loan.ReceivedDate
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

// ... existing code ...

private createPieChart() {
  try {
      const agents = this.AllAgents;
      if (!agents || agents.length === 0) {
          console.warn('No agents found');
          return;
      }

      // Calculate loans per agent and filter out agents with no loans
      const agentLoans = agents
          .filter((agent: any) => agent && agent.name) // Filter invalid agents
          .map((agent: any) => {
              const loans = this.recentLoans;
              const agentLoans = loans ? loans.filter(
                  (loan: any) => loan && loan.AgentName === agent.name
              ) : [];

              return {
                  name: agent.name,
                  loanCount: agentLoans.length,
                  totalAmount: agentLoans.reduce((sum: number, loan: any) => 
                      sum + (parseFloat(loan.Amount) || 0), 0)
              };
          })
          .filter((agent:any) => agent.loanCount > 0) // Only include agents with loans
          .sort((a:any, b:any) => b.totalAmount - a.totalAmount); // Sort by total amount

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
              labels: agentLoans.map((agent:any) => `${agent.name} (${agent.loanCount})`),
              datasets: [{
                  data: agentLoans.map((agent:any) => agent.totalAmount),
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
                    align: 'center',
                    labels: {
                        color: '#333',
                        padding: 8,
                        boxWidth: 12,
                        boxHeight: 12,
                        font: {
                            size: 10 // Smaller font size for legend
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.raw as number;
                            return `Amount: ₹${value.toLocaleString('en-IN')}`;
                        }
                    }
                }
            }
        }
      });
  } catch (error) {
      console.error('Error creating pie chart:', error);
  }
}

// ... existing code ...

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
    if (this.selectedPeriod === 'custom') {
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    let startDate: string;
    let endDate: string;
  
    switch (this.selectedPeriod) {
      case 'all':
        this.GetAllLoans();
        return;
  
      case 'today':
        startDate = this.formatDate(today);
        endDate = this.formatDate(today);
        break;
  
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = this.formatDate(yesterday);
        endDate = this.formatDate(yesterday);
        break;
  
      case 'week':
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        startDate = this.formatDate(oneWeekAgo);
        endDate = this.formatDate(today);
        break;
  
      case 'month':
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        startDate = this.formatDate(oneMonthAgo);
        endDate = this.formatDate(today);
        break;
      case 'custom':
        // const custom = new Date(today);
        // oneMonthAgo.setMonth(today.getMonth() - 1);
        startDate = this.startDate ? this.formatDate(this.startDate) : '';
        endDate = this.endDate ? this.formatDate(this.endDate) : '';
        break;
  
      default:
        this.toast.error('Invalid period selected');
        return;
    }
  
    this.GetLoansByCustomRange(startDate, endDate);
  }
  
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  GetLoansByCustomRange(startDate: string, endDate: string) {
    this.filteredLoans = [];
    this.recentLoans = [];
    this.controllers.GetLoansByDateRange(startDate, endDate).subscribe({
      next: (response) => {
        if (response?.length > 0) {
          this.recentLoans = response;
          this.filteredLoans = response;
          this.datefilterResult = `Loans between ${startDate} and ${endDate}`;
          this.toast.success(this.datefilterResult);          
        } else {
          this.datefilterResult = `No loans found between ${startDate} and ${endDate}`;
          this.toast.warning(this.datefilterResult);
        }
        setTimeout(() => {
          this.initializeCharts();
        },500)
      },
      error: (err) => {
        this.toast.error('Error fetching loans by date range');
        console.error(err);
      }
    });
  }
  

  onDateChange() {
    if (this.selectedPeriod === 'custom' && this.startDate && this.endDate) {
      const start = this.formatDate(this.startDate);
      const end = this.formatDate(this.endDate);
      this.GetLoansByCustomRange(start, end);
    }
  }

  // private filterLoans() {
  //   const now = new Date();
  //   let startDate: Date;
  //   let endDate = new Date(now.setHours(23, 59, 59, 999));

  //   switch (this.selectedPeriod) {
  //     case 'today':
  //       startDate = new Date(now.setHours(0, 0, 0, 0));
  //       break;
  //     case 'yesterday':
  //       startDate = new Date(now.setDate(now.getDate() - 1));
  //       startDate.setHours(0, 0, 0, 0);
  //       endDate = new Date(startDate);
  //       endDate.setHours(23, 59, 59, 999);
  //       break;
  //     case 'week':
  //       startDate = new Date(now.setDate(now.getDate() - 7));
  //       break;
  //     case 'month':
  //       startDate = new Date(now.setMonth(now.getMonth() - 1));
  //       break;
  //     case 'custom':
  //       if (this.startDate && this.endDate) {
  //         startDate = new Date(this.startDate);
  //         endDate = new Date(this.endDate);
  //         endDate.setHours(23, 59, 59, 999);
  //       } else {
  //         return;
  //       }
  //       break;
  //     default:
  //       startDate = new Date(0); // All time
  //   }

  //   this.filteredLoans = this.recentLoans.filter((loan: any) => {
  //     const loanDate = new Date(loan.issuedDate);
  //     return loanDate >= startDate && loanDate <= endDate;
  //   });

  //   this.createPieChart();
  //   this.createTimeDistributionChart();
  // }





}