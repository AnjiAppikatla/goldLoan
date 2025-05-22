import { Component, ChangeDetectorRef, OnInit, ViewChild, TemplateRef, viewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NewLoanComponent } from './new-loan/new-loan.component';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { GoldLoanService } from '../../services/gold-loan.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastService } from '../../services/toastr.service';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AuthService } from '../../services/auth.service';
import { ControllersService } from '../../services/controllers.service';
import { Chart, registerables } from 'chart.js';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
Chart.register(...registerables);
import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { FindPipe } from '../../shared/pipes/find.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { IndentLoanComponent } from '../indent-loan/indent-loan.component';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';



@Component({
  selector: 'app-gold-loans',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatExpansionModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSelectModule,
    MatMenuModule,
    MatRadioModule,
    FindPipe,
    MatTabsModule, IndentLoanComponent],
  templateUrl: './gold-loans.component.html'
})
export class GoldLoansComponent {

  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  @ViewChild('filterdialog') filterDialog!: TemplateRef<any>;
  commissionForm: FormGroup;
  selectedLoan: any;
  @ViewChild('receiveCommission') receiveCommission!: ElementRef;
  loans: any[] = [];
  selectedStatus: string = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  filteredLoans: any[] = [];

  // Add new properties for filtering
  selectedAgent: string = '';
  selectedDateFilter: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  uniqueAgents: any[] = [];
  currentUser: any;
  // filteredLoans: any[] = [];

  merchants: any[] = [];
  selectedMerchant: string | null = null;
  merchantStats = {
    totalLoans: 0,
    totalAmount: 0
  };
  // private merchantChart: Chart | null = null;

  private chart: Chart | null = null;
  chartType: 'merchant' | 'lender' = 'merchant';
  selectedLender: string | null = null;
  selectedFilter: string | null = null;

  loanForm: FormGroup;
  // selectedLoan: any;

  goldloansDiv: boolean = true;

  @ViewChild('editLoanDialog') editLoanDialog!: TemplateRef<any>;
  lenders: any = [];

  constructor(
    private dialog: MatDialog,
    private loanService: GoldLoanService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private toast: ToastService,
    private authService: AuthService,
    private controllers: ControllersService,

  ) {
    this.commissionForm = this.fb.group({
      commissionTotal: ['', Validators.required],
      received: ['', Validators.required],
      receivable: ['', Validators.required]
    });

    this.loanForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      city: ['', Validators.required]
    });

    // Add subscription to form value changes
    this.commissionForm.valueChanges.subscribe(() => {
      const total = parseFloat(this.commissionForm.get('commissionTotal')?.value) || 0;
      const received = parseFloat(this.commissionForm.get('received')?.value) || 0;

      // Calculate receivable amount
      const receivable = total - received;

      // Update the receivable control without triggering another valueChanges event
      this.commissionForm.patchValue({
        receivable: receivable.toFixed(2)
      }, { emitEvent: false });
    });
  }

  ngOnInit() {

    this.goldloansDiv = true;
    this.chartType = 'merchant'

    // Initialize selections
    this.selectedFilter = null;
    this.selectedAgent = '';
    this.selectedDateFilter = '',
      this.GetAllLoans();
    // this.GetAllBranches();
    this.GetAllMerchants();
    this.GetAllLenders()
    this.loadLoans();
    this.GetAllAgents();
    this.currentUser = this.authService.currentUserValue;
    // Get loans from service
    // this.loans = this.loanService.getLoans() || [];

    // Initialize filtered loans
    // this.filteredLoans = [...this.loans];

    // this.uniqueAgents = [...new Set(this.authService.users.map(loan => loan.name))].filter(agent => agent);
    this.filteredLoans = [...this.loans];
    // Initialize and calculate progress for each loan
    this.loans = this.loans.map(loan => {
      if (!loan) return null; // Skip if loan is undefined

      // Calculate progress - ensure it has a default value
      const progress = this.loanService.calculateProgress(loan) || { progress: 0, status: 'safe' };

      // Initialize totalReceivedCommission if not exists
      const totalReceivedCommission = typeof loan.totalReceivedCommission === 'number'
        ? loan.totalReceivedCommission
        : 0;

      // Calculate total received commission
      const calculatedReceivedCommission = Array.isArray(loan.receivedCommissions)
        ? loan.receivedCommissions.reduce((total: number, commission: any) => {
          return total + (parseFloat(commission.receivedCommission) || 0);
        }, 0)
        : 0;

      // Return loan with guaranteed progress property
      return {
        ...loan,
        progress: progress, // Ensure progress object exists
        totalReceivedCommission: calculatedReceivedCommission,
        receivableCommission: parseFloat(loan.commissionAmount || 0) - calculatedReceivedCommission
      };
    }).filter(loan => loan !== null); // Remove any null entries

    // Only get unique agents list for admin
    if (this.currentUser?.role === 'admin') {
      this.uniqueAgents = this.uniqueAgents.filter(user => user.role === 'agent');
    }

    // Calculate progress for each loan
    this.filteredLoans = this.filteredLoans.map(loan => ({
      ...loan,
      progress: this.loanService.calculateProgress(loan) || { progress: 0, status: 'safe' }
    }));

    this.createChart();

    this.cdr.detectChanges();
  }

  loadLoans() {
    this.controllers.GetAllLoans().subscribe(
      (response) => {
        this.loans = response;
        this.filteredLoans = [...this.loans];
        this.createChart(); // Initialize chart after loading data
      },
      (error) => {
        console.error('Error fetching loans:', error);
      }
    );
  }

  GetAllAgents() {
    this.controllers.GetAllAgents().subscribe(
      (response) => {
        this.uniqueAgents = response;
        this.createChart(); // Initialize chart after loading data
      },
      (error) => {
        console.error('Error fetching loans:', error);
      }
    );
  }

  setChartType(type: 'merchant' | 'lender') {
    this.chartType = type;
    this.selectedFilter = null;
    this.createChart();
  }

  onFilterChange(event: any, type: string) {
    // Preserve other filter values
    const prevAgent = this.selectedAgent;
    const prevDateFilter = this.selectedDateFilter;
    const prevFromDate = this.fromDate;
    const prevToDate = this.toDate;

    this.applyFilters();

    // Restore preserved values
    this.selectedAgent = prevAgent;
    this.selectedDateFilter = prevDateFilter;
    this.fromDate = prevFromDate;
    this.toDate = prevToDate;
  }

  // onMerchantChange() {
  //   this.applyFilters();
  // }

  // onLenderChange() {
  //   this.applyFilters();
  // }

  IndentLoans() {
    this.goldloansDiv = false;
  }

  toggleView() {
    this.goldloansDiv = true;
    this.onChartTypeChange('merchant')
    this.ngOnInit();
  }

  async downloadData(format: 'excel' | 'pdf', type: 'all' | 'filtered') {
    let filteredLoans = this.chartType === 'merchant'
      ? (this.selectedMerchant
        ? this.loans.filter((loan: any) => loan.MerchantId === this.selectedMerchant)
        : this.loans)
      : (this.selectedLender
        ? this.loans.filter((loan: any) => loan.Lender === this.selectedLender)
        : this.loans);
  
    if (format === 'excel') {
      this.exportToExcel(filteredLoans);
    } else {
      await this.exportToPDF(filteredLoans);
    }
  }

  downloadDataSingle(type: string, loan: any) {
    // Create an array with single loan
    const loanData = [loan];
    
    if (type === 'excel') {
      this.exportToExcel(loanData);
      this.createChart();
    } else {
      this.exportToPDF(loanData);
    }
  }

  private exportToExcel(data: any[], isSingleEntry: boolean = false) {
    try {
      // Format data based on selected filter
      const formattedData = data.map(loan => ({
        'Name': loan.Name || 'N/A',
        'Amount': loan.Amount || 0,
        'Merchant': this.merchants.find(m => m.merchantId === loan.MerchantId)?.merchantName || 'N/A',
        'Lender': this.lenders.find((l: any) => l.lenderId === loan.Lender)?.Lender || 'N/A',
        'Mobile': loan.MobileNo || 'N/A',
        'City': loan.City || 'N/A',
        'Agent Name': loan.AgentName || 'N/A',
        'Issue Date': loan.IssuedDate ? new Date(loan.IssuedDate).toLocaleDateString() : 'N/A',
        'Maturity Date': loan.MaturityDate ? new Date(loan.MaturityDate).toLocaleDateString() : 'N/A',
        'Status': this.calculateProgress(loan).status || 'N/A',
        'Commission Amount': loan.CommissionAmount || 0,
        'Commission Status': loan.CommissionStatus || 'N/A',
        'Payment Type': loan.PaymentType || 'N/A',
        'Online Payment Type': loan.OnlinePaymentType || 'N/A',
        'Received By': loan.ReceivedBy || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Loans');

      const fileName = this.generateFileName(data, isSingleEntry);
      XLSX.writeFile(workbook, fileName);
      this.toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.toast.error('Failed to download Excel file');
    }
  }

  private generateFileName(data: any[], isSingleEntry: boolean): string {
    if (isSingleEntry) {
      const loan = data[0];
      const merchant = this.merchants.find(m => m.merchantId === loan.MerchantId)?.merchantName || 'Unknown';
      const lender = this.lenders.find((l: any) => l.lenderId === loan.Lender)?.lenderName || 'Unknown';
      return `Loan_${loan.Name}_${merchant}_${lender}_${new Date().toISOString().split('T')[0]}.xlsx`;
    }
  
    return `Loans_Report_${this.chartType === 'merchant' ? 'Merchant' : 'Lender'}_${this.getFilterName()}_${new Date().toISOString().split('T')[0]}.xlsx`;
  }


  private async exportToPDF(loans: any[], isSingleEntry: boolean = false) {
    const pdf = new jsPDF('landscape');
    const chartCanvas = document.getElementById('goldLoansChart') as HTMLCanvasElement;

    // Add title
    const title = this.generateTitle(loans, isSingleEntry);

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

  private generateTitle(loans: any[], isSingleEntry: boolean): string {
    if (isSingleEntry) {
      const loan = loans[0];
      const merchant = this.merchants.find(m => m.merchantId === loan.MerchantId)?.merchantName || 'Unknown';
      const lender = this.lenders.find((l: any) => l.lenderId === loan.Lender)?.lenderName || 'Unknown';
      return `Loan Report - ${loan.Name} (${merchant} - ${lender})`;
    }
  
    return this.chartType === 'merchant'
      ? `${this.selectedMerchant ? this.merchants.find(m => m.merchantId === this.selectedMerchant)?.merchantName : 'All'} Merchant Report`
      : `${this.selectedLender ? this.lenders.find((l: any) => l.lenderId === this.selectedLender)?.lenderName : 'All'} Lender Report`;
  }

  // Helper method to get filter name for file naming
  private getFilterName(): string {
    if (!this.selectedFilter) return 'All';

    if (this.chartType === 'merchant') {
      const merchant = this.merchants.find(m => m.merchantid === this.selectedFilter);
      return merchant ? merchant.merchantName : 'Unknown_Merchant';
    } else {
      const lender = this.lenders.find((l: any) => l.lenderName === this.selectedFilter);
      return lender ? lender.lenderName : 'Unknown_Lender';
    }
  }


  applyFilters() {
    let tempLoans = [...this.loans];

    // Apply merchant/lender filter
    if (this.selectedFilter) {
      tempLoans = tempLoans.filter(loan => {
        const compareId = this.chartType === 'merchant' ? loan.MerchantId : loan.LenderId;
        return compareId === this.selectedFilter;
      });
    }

    this.filteredLoans = tempLoans;
    this.createChart();
    this.cdr.detectChanges();
  }

  filterDialogClose() {
    const dialogRef = this.dialog.getDialogById('filterDialog');
    if (dialogRef) {
      dialogRef.close();
    }
  }

  // Add this method to reset all filters
  resetFilters(): void {
    this.selectedAgent = '';
    this.selectedDateFilter = '';
    this.fromDate = null;
    this.toDate = null;
    this.filteredLoans = [...this.loans];
  }

  GetAllLoans() {
    this.filteredLoans = [];
    this.controllers.GetAllLoans().subscribe({
      next: (response) => {
        if (response) {
          this.filteredLoans = response;
          this.filteredLoans.map((loan: any) => {
            const { progress, status } = this.loanService.calculateProgress(loan);
            loan.progress = progress;
            loan.status = status;
          });
          console.log(this.filteredLoans);
        }
      },
      error: (error) => {
        console.error('Error fetching loans:', error);
      }
    });

  }

  // GetAllBranches() {
  //   this.loanService.cities = [];
  //   this.controllers.GetAllBranches().subscribe({
  //     next: (data) => {
  //       if (data) {
  //         this.loanService.cities = data;
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching cities:', error);
  //     }
  //   });
  //   this.GetAllLenders()
  // }

  GetAllLenders() {
    this.controllers.GetAllLenders().subscribe({
      next: (response) => {
        if (response) {
          this.lenders = response;
          this.createChart();
        }
      }
    });
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

  openNewLoanDialog() {
    const dialogWidth = window.innerWidth <= 768 ? '96vw' : '800px';
    const dialogRef = this.dialog.open(NewLoanComponent, {
      width: dialogWidth,
      maxWidth: '100vw',
      height: '85h',
      disableClose: true,
      autoFocus: true,
      restoreFocus: true,
      ariaDescribedBy: 'new-loan-dialog-description',
      role: 'dialog',
      panelClass: ['full-width-dialog']
    });

    // Subscribe to dialog close event
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload loans data
        this.GetAllLoans();

        // Initialize progress for new loans
        this.loans = this.loans.map(loan => {
          if (!loan) return null;

          // Calculate progress
          const progress = this.loanService.calculateProgress(loan) || { progress: 0, status: 'safe' };

          // Initialize commission values
          const totalReceivedCommission = Array.isArray(loan.receivedCommissions)
            ? loan.receivedCommissions.reduce((total: number, commission: any) => {
              return total + (parseFloat(commission.receivedCommission) || 0);
            }, 0)
            : 0;

          return {
            ...loan,
            progress: progress,
            totalReceivedCommission: totalReceivedCommission,
            receivableCommission: parseFloat(loan.commissionAmount || 0) - totalReceivedCommission,
            // Initialize other required properties
            receivedCommissions: loan.receivedCommissions || []
          };
        }).filter(loan => loan !== null);

        // Update filtered loans as well
        this.filteredLoans = [...this.loans];

        // Update unique agents list
        // this.uniqueAgents = [...new Set(this.loans.map(loan => loan.agentname))].filter(agent => agent);

        // Show success message
        // this.toast.success('Loan created successfully');

        // Force change detection
        this.cdr.detectChanges();
      }
    });
  }

  private createChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    const canvas = document.getElementById('goldLoansChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.chartType === 'merchant'
      ? this.calculateMerchantDistribution()
      : this.calculateLenderDistribution();

    this.chart = new Chart(ctx, {
      type: 'pie',  // Changed to pie chart
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw as number;
                return '₹' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  // Helper methods for chart data
  private getDataByMerchant(loans: any[]) {
    const merchantData = loans.reduce((acc, loan) => {
      const merchant = this.merchants.find(m => m.merchantId === loan.MerchantId);
      const name = merchant ? merchant.merchantName : 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(merchantData),
      values: Object.values(merchantData)
    };
  }

  private getDataByLender(loans: any[]) {
    const lenderData = loans.reduce((acc, loan) => {
      const lender = this.lenders.find((l: any) => l.lenderId === loan.LenderId);
      const name = lender ? lender.lenderName : 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(lenderData),
      values: Object.values(lenderData)
    };
  }

  private calculateMerchantDistribution() {
    const merchantData = new Map<string, { count: number, amount: number }>();

    let filteredLoans = this.getFilteredLoans();

    filteredLoans.forEach(loan => {
      const merchant = this.merchants.find(m => m.merchantid === loan.MerchantId);
      const merchantName = merchant?.merchantName || 'Unknown';
      const currentData = merchantData.get(merchantName) || { count: 0, amount: 0 };
      merchantData.set(merchantName, {
        count: currentData.count + 1,
        amount: currentData.amount + (parseFloat(loan.Amount) || 0)
      });
    });

    return {
      labels: Array.from(merchantData.keys()),
      values: Array.from(merchantData.values()).map(data => data.amount)
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

  private getFilteredLoans() {
    let filteredLoans = [...this.loans];

    // Apply agent filter (admin only)
    if (this.currentUser?.role === 'admin' && this.selectedAgent) {
      filteredLoans = filteredLoans.filter(loan => loan.AgentName === this.selectedAgent);
    }

    // Apply date filter
    if (this.selectedDateFilter) {
      filteredLoans = this.applyDateFilter(filteredLoans);
    }

    // Apply merchant/lender filter
    if (this.selectedFilter) {
      if (this.chartType === 'merchant') {
        filteredLoans = filteredLoans.filter(loan => loan.MerchantId === this.selectedFilter);
      } else {
        filteredLoans = filteredLoans.filter(loan => loan.LenderId === this.selectedFilter);
      }
    }

    return filteredLoans;
  }

  private applyDateFilter(loans: any[]) {
    const today = new Date();
    switch (this.selectedDateFilter) {
      case 'today':
        return loans.filter(loan => {
          const loanDate = new Date(loan.IssuedDate);
          return loanDate.toDateString() === today.toDateString();
        });
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return loans.filter(loan => {
          const loanDate = new Date(loan.IssuedDate);
          return loanDate.toDateString() === yesterday.toDateString();
        });
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return loans.filter(loan => {
          const loanDate = new Date(loan.IssuedDate);
          return loanDate >= weekStart && loanDate <= today;
        });
      case 'thisMonth':
        return loans.filter(loan => {
          const loanDate = new Date(loan.IssuedDate);
          return loanDate.getMonth() === today.getMonth() &&
            loanDate.getFullYear() === today.getFullYear();
        });
      case 'custom':
        if (this.fromDate && this.toDate) {
          return loans.filter(loan => {
            const loanDate = new Date(loan.IssuedDate);
            return loanDate >= this.fromDate! && loanDate <= this.toDate!;
          });
        }
        return loans;
      default:
        return loans;
    }
  }

  onChartTypeChange(type: 'merchant' | 'lender') {
    this.chartType = type;
    this.selectedFilter = null;
    this.filteredLoans = [...this.loans];
    this.createChart();
    this.cdr.detectChanges();
  }

  calculateProgress(loan: any): { progress: number; status: string } {
    if (!loan.issuedDate || !loan.maturityDate) {
      return { progress: 0, status: 'safe' };
    }

    const today = new Date();
    const issuedDate = new Date(loan.issuedDate);
    const maturityDate = new Date(loan.maturityDate);

    const totalDays = maturityDate.getTime() - issuedDate.getTime();
    const daysLeft = maturityDate.getTime() - today.getTime();
    const progress = Math.min(Math.max(((totalDays - daysLeft) / totalDays) * 100, 0), 100);

    // Reverse the status logic - start with green and transition to red
    let status = 'safe';
    if (progress >= 75) {
      status = 'warning';
    }
    if (progress >= 90) {
      status = 'danger';
    }

    return {
      progress: Math.round(progress * 100) / 100,
      status: status
    };
  }

  getProgressClass(progress: number): string {
    if (progress >= 90) {
      return 'bg-red-500';
    } else if (progress >= 75) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  }

  getProgressTextClass(progress: number): string {
    if (progress >= 90) {
      return 'text-red-500';
    } else if (progress >= 75) {
      return 'text-yellow-500';
    }
    return 'text-green-500';
  }


  commissionEnterClick(id: any) {
    this.loans.forEach((loan) => {
      if (loan.leadId === id) {
        const obj = Object.assign({});
        obj.receivedCommission = loan.leadId;
        loan.receivedCommissions
      }
    });
  }

  openEditDialog(loan: any) {
    this.selectedLoan = { ...loan };

    // Calculate total received commission from the array
    const totalReceived = Array.isArray(loan.receivedCommissions)
      ? loan.receivedCommissions.reduce((sum: number, commission: any) =>
        sum + (parseFloat(commission.receivedCommission) || 0), 0)
      : loan.totalReceivedCommission || 0;

    // Initialize form with latest values
    this.commissionForm.patchValue({
      commissionTotal: parseFloat(loan.commissionAmount || 0),
      received: totalReceived, // Show current received amount instead of 0
      receivable: parseFloat(loan.commissionAmount || 0) - totalReceived
    });

    const dialogRef = this.dialog.open(this.editDialog, {
      width: '400px',
      id: 'editDialog',
      data: this.selectedLoan,
      disableClose: false // Allow clicking outside to close
    });

    dialogRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        if (this.receiveCommission?.nativeElement) {
          this.receiveCommission.nativeElement.focus();
        }
      }, 100);
    });
  }

  filterDialong() {
    this.dialog.open(this.filterDialog, {
      width: '400px',
      id: 'filterDialog'
    });
  }

  updateCommission() {
    if (this.commissionForm.valid) {
      try {
        const newCommission = parseFloat(this.commissionForm.value.received);
        const totalCommission = parseFloat(this.selectedLoan.commissionAmount);

        // Validate commission amount
        if (newCommission > totalCommission) {
          this.toast.warning(`Commission cannot exceed total amount of ${totalCommission}`)
          return;
        }

        // Update commission in service
        this.loanService.updateCommission(this.selectedLoan.leadId, {
          received: newCommission
        });

        // Update local data with progress calculation
        this.loans = this.loans.map(loan => {
          if (loan.leadId === this.selectedLoan.leadId) {
            // Calculate progress
            const progress = this.loanService.calculateProgress(loan);

            return {
              ...loan,
              progress: progress,
              totalReceivedCommission: newCommission,
              receivableCommission: totalCommission - newCommission
            };
          }
          // Preserve existing loan data including progress
          return {
            ...loan,
            progress: loan.progress // Keep existing progress
          };
        });

        // Close only the dialog, not the expansion panel
        const dialogRef = this.dialog.getDialogById('editDialog');
        if (dialogRef) {
          dialogRef.close();
        }

        // Show success message
        this.toast.success('Commission updated successfully');

        // Force change detection to update the view
        this.cdr.detectChanges();
      } catch (error: any) {
        this.toast.error(error.message);
      }
    }
  }

  editLoan(loan: any) {
    const dialogRef = this.dialog.open(NewLoanComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: { loan, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.GetAllLoans(); // Refresh the list
      }
    });
  }

  // updateLoan() {
  //   if (this.loanForm.valid && this.selectedLoan) {
  //     const updatedLoan = {
  //       ...this.selectedLoan,
  //       Name: this.loanForm.value.name,
  //       Amount: this.loanForm.value.amount,
  //       MobileNo: this.loanForm.value.mobileNo,
  //       City: this.loanForm.value.city
  //     };

  //     this.controllers.UpdateLoan(updatedLoan).subscribe({
  //       next: (response) => {
  //         if (response) {
  //           this.dialog.closeAll();
  //           this.GetAllLoans(); // Refresh the list
  //         }
  //       }
  //     });
  //   }
  // }

  deleteLoan(loan: any) {
    // Only allow admin to delete
    if (this.currentUser?.role !== 'admin') return;

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
              this.toast.success('Loan deleted successfully');
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

  downloadMerchantReport() {
    const filteredLoans = this.selectedMerchant
      ? this.loans.filter((loan: any) => loan.MerchantId === this.selectedMerchant)
      : this.loans;

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







}
