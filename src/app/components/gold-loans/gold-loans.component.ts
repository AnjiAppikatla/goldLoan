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
import { LoanImagesDialogComponent } from './loan-images-dialog/loan-images-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';



@Component({
  selector: 'app-gold-loans',
  standalone: true,
  styleUrls: ['./gold-loans.component.scss'],
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
    // FindPipe,
    MatTabsModule, IndentLoanComponent, MatCheckboxModule],
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

  commissionDisplay: any = [];
  singleLoanCommsionObject: any = {};
  isChecked: boolean = false;

  // Add new properties for filtering
  selectedAgent: string = '';
  selectedDateFilter: string = '';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  uniqueAgents: any[] = [];
  currentUser: any;
  isAdmin: boolean = false;
  groupedLoans: { [key: string]: any[] } = {};

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
    this.currentUser = this.authService.currentUserValue;
    this.isAdmin = this.currentUser?.role === 'admin';

    this.goldloansDiv = true;
    this.chartType = 'merchant'

    // Initialize selections
    this.selectedFilter = null;
    this.selectedAgent = '';
    this.selectedDateFilter = '',

      // this.GetAllBranches();
      this.GetAllMerchants();
    this.GetAllLenders()

    this.loadLoans();
    this.GetAllAgents();
    //  this.GetAllLoans();
    // Get loans from service
    // this.loans = this.loanService.getLoans() || [];

    // Initialize filtered loans
    // this.filteredLoans = [...this.loans];

    // this.uniqueAgents = [...new Set(this.authService.users.map(loan => loan.name))].filter(agent => agent);
    this.loans = [...this.loans].reverse();
    this.filteredLoans = [...this.loans];
    // this.filteredLoans = [...this.filteredLoans].reverse();
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
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // e.g., 6 for June
    const currentYear = today.getFullYear();  // e.g., 2025
    // this.controllers.GetAllLoans().subscribe((res: any) => {
    this.controllers.GetLoansByMonth(currentMonth, currentYear).subscribe((res: any) => {
      if (res) {
        this.loans = res;

        this.loans = this.loans.map(loan => ({
          ...loan,
          ReceivedDate: loan.ReceivedDate == '0000-00-00 00:00:00' ? '' : loan.ReceivedDate,
          images: []
        }));

        // this.loans.forEach(loan => {
        //   this.loadLoanImages(loan.Id);
        // });

        if (this.currentUser?.role === 'admin') {
          // Group loans by agent
          this.groupedLoans = this.loans.reduce((groups: { [key: string]: any[] }, loan: any) => {
            const agent = loan.AgentName || 'Unassigned';
            if (!groups[agent]) {
              groups[agent] = [];
            }
            groups[agent].push(loan);
            return groups;
          }, {});
        } else {
          // For agents, only show their own loans
          this.loans = this.loans.filter(loan => loan.AgentName === this.currentUser.name);
        }
        this.filteredLoans = [...this.loans];
        this.applyFilters();
        this.filteredLoans.map(loan => {
          this.CalculateCommission(loan);
        });

      }
    });
  }

  CalculateCommission(loan: any) {
    if (loan.CommissionReceived) {
      const parsed = JSON.parse(loan.CommissionReceived);

      // Normalize to array
      const receivedCommissions = Array.isArray(parsed) ? parsed : [parsed];
      const totalReceivedCommission = receivedCommissions.reduce(
        (sum: number, entry: any) => sum + (parseFloat(entry.received) || 0),
        0
      );
      const receivableCommission =
        parseFloat(loan.CommissionAmount || 0) - totalReceivedCommission;

      if (receivedCommissions) {
        const obj = Object.assign({})
        obj.loan_Id = loan.Id;
        obj.CommissionAmount = loan.CommissionAmount;
        obj.receivedCommissions = receivedCommissions;
        obj.receivableCommission = receivableCommission;
        obj.totalReceivedCommission = totalReceivedCommission;
        this.commissionDisplay.push(obj);
      }

      loan.receivedCommissions = totalReceivedCommission;
      loan.receivableCommission = receivableCommission;

      return { ...loan };
    }
  }


  calculateCommissionValues(loan: any) {
    try {
      let commissionReceived;
      if (loan.CommissionReceived) {
        try {
          commissionReceived = JSON.parse(loan.CommissionReceived);
          // Handle both array and single object cases
          if (!Array.isArray(commissionReceived)) {
            commissionReceived = [commissionReceived];
          }
        } catch (e) {
          // If parsing fails, assume it's a direct number
          commissionReceived = [{ Received: parseFloat(loan.CommissionReceived) || 0 }];
        }
      } else {
        commissionReceived = [];
      }

      // Calculate total received commission
      loan.totalReceivedCommission = commissionReceived.reduce(
        (sum: number, entry: any) => sum + (parseFloat(entry.Received) || 0),
        0
      );

      // Calculate receivable commission
      loan.receivableCommission = parseFloat(loan.CommissionAmount || 0) - loan.totalReceivedCommission;

      // Ensure values are not negative
      loan.totalReceivedCommission = Math.max(0, loan.totalReceivedCommission);
      loan.receivableCommission = Math.max(0, loan.receivableCommission);
    } catch (e) {
      console.error('Error calculating commission values:', e);
      loan.totalReceivedCommission = 0;
      loan.receivableCommission = parseFloat(loan.CommissionAmount || 0);
    }
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

  downloadData(format: 'excel' | 'pdf') {
    let filteredLoans = this.chartType === 'merchant'
      ? (this.selectedMerchant
        ? this.loans.filter((loan: any) => loan.MerchantId === this.selectedMerchant)
        : this.loans)
      : (this.selectedLender
        ? this.loans.filter((loan: any) => this.lenders.find((lender: any) => lender.lenderName === loan.Lender)?.id === this.selectedLender)
        : this.loans);

    if (format === 'excel') {
      this.exportToExcel(filteredLoans);
    } else {
      this.exportToPDF(filteredLoans);
    }
  }

  async downloadDataSingle(loan: any, type: 'excel' | 'pdf') {
    if (type === 'excel') {
      this.exportToExcel([loan]);
    } else {
      await this.exportToPDF([loan]);
    }
  }

  CalCForXl(loan: any) {
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
        'Commission Amount': isAdmin ? loan.CommissionAmount : '-',
        'Commission Received': isAdmin ? this.CalCForXl(loan) : '-',
        'Receivable Commission': isAdmin ? loan.CommissionAmount - this.CalCForXl(loan.CommissionReceived) : '-',
        'Commission Percentage': isAdmin ? loan.CommissionPercentage : '-'
      }));

      const totalAmount = loans.reduce((sum, loan) => sum + (Number(loan.Amount) || 0), 0);
      formattedData.push({
        'Name': '',
        'Amount': '',
        'Merchant': '',
        'Lender': '',
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
        : this.chartType === 'merchant'
          ? `Merchant_${this.selectedMerchant ? this.merchants.find(m => m.merchantid === this.selectedMerchant)?.merchantName : 'All'}`
          : `Lender_${this.selectedLender ? loans[0].Lender : 'All'}`;

      XLSX.writeFile(wb, `${title}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
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


  private async exportToPDF(loans: any[]): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    const chartCanvas = document.getElementById('goldLoansChart') as HTMLCanvasElement;

    // Generate Title
    const title = loans.length === 1
      ? `Loan Details - ${loans[0].Name}`
      : this.chartType === 'merchant'
        ? `Merchant Report - ${this.selectedMerchant ? this.merchants.find(m => m.merchantid === this.selectedMerchant)?.merchantName : 'All Merchants'}`
        : `Lender Report - ${this.selectedLender ? this.lenders.find((l: any) => l.id === this.selectedLender)?.lenderName : 'All Lenders'}`;

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
      const imgWidth = 95; // Reduced chart size
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

    // Table Headers and Body remain the same
    const headers = [
      ['Name', 'Amount', 'Lender', 'Lead Id', 'Merchant', 'Issue Date', 'Maturity Date', 'City', 'Agent']
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

  onDateChange() {
    if (this.selectedDateFilter === 'custom' && this.fromDate && this.toDate) {
      const start = this.formatDate(this.fromDate);
      const end = this.formatDate(this.toDate);
      this.GetLoansByCustomRange(start, end);
      this.filterDialogClose();
    }
  }


  applyFilters() {
    let tempLoans = [...this.loans];

    if (this.currentUser?.role !== 'admin') {
      tempLoans = tempLoans.filter(loan => loan.AgentName === this.currentUser.name);
    } else if (this.selectedAgent) {
      tempLoans = tempLoans.filter(loan => loan.AgentName === this.selectedAgent);
    }

    if (this.selectedDateFilter === 'custom') {
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    let startDate: string;
    let endDate: string;

    // Date filter
    if (this.selectedDateFilter) {
      switch (this.selectedDateFilter) {
        case 'all':
          this.loadLoans();
          break;
        case 'today':
          startDate = this.formatDate(today);
          endDate = this.formatDate(today);
          this.GetLoansByCustomRange(startDate, endDate);
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = this.formatDate(yesterday);
          endDate = this.formatDate(yesterday);
          this.GetLoansByCustomRange(startDate, endDate);
          break;
        case 'week':
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          startDate = this.formatDate(oneWeekAgo);
          endDate = this.formatDate(today);
          this.GetLoansByCustomRange(startDate, endDate);
          break;
        case 'month':
          const oneMonthAgo = new Date(today);
          oneMonthAgo.setMonth(today.getMonth() - 1);
          startDate = this.formatDate(oneMonthAgo);
          endDate = this.formatDate(today);
          this.GetLoansByCustomRange(startDate, endDate);
          break;
        case 'custom':
          if (this.fromDate && this.toDate) {
            startDate = this.fromDate ? this.formatDate(this.fromDate) : '';
            endDate = this.toDate ? this.formatDate(this.toDate) : '';
          }
          break;
          default:
            this.toast.error('Invalid period selected');
            return;
          }

      // Merchant/Lender filter
      if (this.chartType === 'merchant' && this.selectedMerchant) {
        tempLoans = tempLoans.filter(loan => loan.MerchantId === this.selectedMerchant);
      } else if (this.chartType === 'lender' && this.selectedLender) {
        tempLoans = tempLoans.filter(loan => {
          const lender = this.lenders.find((l: any) => l.id === this.selectedLender);
          return loan.Lender === lender?.lenderName;
        });
      }

      // Update filtered loans
      this.filteredLoans = tempLoans;

      // Update grouping for admin users
      if (this.currentUser?.role === 'admin') {
        this.groupedLoans = tempLoans.reduce((groups: { [key: string]: any[] }, loan: any) => {
          const agent = loan.AgentName || 'Unassigned';
          if (!groups[agent]) {
            groups[agent] = [];
          }
          groups[agent].push(loan);
          return groups;
        }, {});
      }

      this.createChart();
      this.cdr.detectChanges();
    }

    // Merchant/Lender filter
    if (this.selectedFilter) {
      tempLoans = tempLoans.filter(loan => {
        const compareId = this.chartType === 'merchant' ? loan.MerchantId : this.lenders.find((l: any) => l.lenderName === loan.Lender)?.id;
        return compareId === this.selectedFilter;
      });
    }

    if (this.selectedDateFilter === 'custom') {

    }
    else {
      this.filterDialogClose();
    }

    if (this.currentUser?.role === 'admin') {
      // Group filtered loans by agent
      this.groupedLoans = tempLoans.reduce((groups: { [key: string]: any[] }, loan: any) => {
        const agent = loan.AgentName || 'Unassigned';
        if (!groups[agent]) {
          groups[agent] = [];
        }
        groups[agent].push(loan);
        return groups;
      }, {});
    } else {
      // For non-admin users, only show their own loans
      this.groupedLoans = {
        [this.currentUser.name]: tempLoans.filter(loan => loan.AgentName === this.currentUser.name)
      };
    }
    this.createChart();
    this.cdr.detectChanges();
    this.filterDialogClose();
  }

  filterDialogClose() {
    const dialogRef = this.dialog.getDialogById('filterDialog');
    if (dialogRef) {
      dialogRef.close();
      this.dialog.closeAll(); // Ensure all dialogs are closed
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

  // GetAllLoans() {
  //   this.filteredLoans = [];
  //   this.controllers.GetAllLoans().subscribe({
  //     next: (response) => {
  //       if (response) {
  //         this.filteredLoans = response;
  //         this.createChart();
  //         this.filteredLoans = [...this.filteredLoans].reverse();
  //         this.filteredLoans.map((loan: any) => {
  //           const { progress, status } = this.loanService.calculateProgress(loan);
  //           loan.progress = progress;
  //           loan.status = status;
  //         });
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching loans:', error);
  //     }
  //   });

  // }

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
        this.loadLoans();

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

    // Format labels to include loan count
    const formattedLabels = data.labels.map((label, index) => {
      const count = this.chartType === 'merchant'
        ? this.filteredLoans.filter(loan => this.merchants.find(m => m.merchantName === label)?.merchantid === loan.MerchantId).length
        : this.filteredLoans.filter(loan => loan.Lender === label).length;
      return `${label} (${count})`;
    });

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: formattedLabels,
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
                const label = context.label || '';
                const count = label.match(/\((\d+)\)$/)?.[1] || '0';
                return `${label}: ${value.toLocaleString()} loans`;
              }
            }
          }
        }
      }
    });
  }

  // // Helper methods for chart data
  // private getDataByMerchant(loans: any[]) {
  //   const merchantData = loans.reduce((acc, loan) => {
  //     const merchant = this.merchants.find(m => m.merchantId === loan.MerchantId);
  //     const name = merchant ? merchant.merchantName : 'Unknown';
  //     acc[name] = (acc[name] || 0) + 1;
  //     return acc;
  //   }, {});

  //   return {
  //     labels: Object.keys(merchantData),
  //     values: Object.values(merchantData)
  //   };
  // }

  // private getDataByLender(loans: any[]) {
  //   const lenderData = loans.reduce((acc, loan) => {
  //     const lender = this.lenders.find((l: any) => l.lenderId === loan.LenderId);
  //     const name = lender ? lender.lenderName : 'Unknown';
  //     acc[name] = (acc[name] || 0) + 1;
  //     return acc;
  //   }, {});

  //   return {
  //     labels: Object.keys(lenderData),
  //     values: Object.values(lenderData)
  //   };
  // }

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
      values: Array.from(merchantData.values()).map(data => data.count) // Use count instead of amount
    };
  }

  private calculateLenderDistribution() {
    const lenderData = new Map<string, { count: number, amount: number }>();

    // Filter loans based on selected lender
    const filteredLoans = this.selectedFilter
      ? this.filteredLoans.filter((loan: any) => {
        const selectedLender = this.lenders.find((l: any) => l.id === this.selectedFilter);
        return loan.Lender === selectedLender?.lenderName;
      })
      : this.filteredLoans;

    // Aggregate loan data directly from loans instead of initializing all lenders
    filteredLoans.forEach((loan: any) => {
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
    if (this.currentUser?.role === 'admin') {
      // Group filtered loans by agent
      this.groupedLoans = this.filteredLoans.reduce((groups: { [key: string]: any[] }, loan: any) => {
        const agent = loan.AgentName || 'Unassigned';
        if (!groups[agent]) {
          groups[agent] = [];
        }
        groups[agent].push(loan);
        return groups;
      }, {});
    } else {
      // For non-admin users, only show their own loans
      this.groupedLoans = {
        [this.currentUser.name]: this.filteredLoans.filter(loan => loan.AgentName === this.currentUser.name)
      };
    }
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

    // // Calculate total received commission from the array
    // const totalReceived = Array.isArray(loan.CommissionReceived)
    //   ? loan.receivedCommissions.reduce((sum: number, commission: any) =>
    //     sum + (parseFloat(commission.CommissionReceived) || 0), 0)
    //   : loan.CommissionReceived || 0;

    // Initialize form with latest values
    this.commissionForm.patchValue({
      commissionTotal: loan.receivableCommission,
      received: 0, // Show current received amount instead of 0
      receivable: loan.receivableCommission
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
        const totalCommission = parseFloat(this.selectedLoan.CommissionAmount);

        // Parse existing commission JSON safely
        let existingCommissions: any[] = [];
        try {
          if (this.selectedLoan.CommissionReceived) {
            const parsed = JSON.parse(this.selectedLoan.CommissionReceived);
            existingCommissions = Array.isArray(parsed) ? parsed : [parsed];
          }
        } catch (e) {
          console.error('Error parsing commission data:', e);
          existingCommissions = [];
        }

        // Calculate total already received
        const totalReceived = existingCommissions.reduce((sum, entry) =>
          sum + (parseFloat(entry.received) || 0), 0);

        const remainingCommission = totalCommission - totalReceived;

        if (newCommission > remainingCommission) {
          this.toast.warning(`Commission cannot exceed remaining amount of ₹${remainingCommission}`);
          return;
        }

        // Create new commission entry
        const newEntry = {
          received: newCommission,
          date: new Date().toISOString().split('T')[0], // yyyy-mm-dd format
          remaining: remainingCommission - newCommission
        };

        // Add new entry
        existingCommissions.push(newEntry);

        // Update the local loan model - keep as array here, backend will encode
        this.selectedLoan.CommissionReceived = existingCommissions;

        // Call backend update API
        this.controllers.UpdateCommission({ CommissionReceived: this.selectedLoan.CommissionReceived }, Number(this.selectedLoan.Id))
          .subscribe({
            next: (response) => {
              if (response) {
                const dialogRef = this.dialog.getDialogById('editDialog');
                if (dialogRef) dialogRef.close();

                this.loadLoans(); // reload updated list
                this.toast.success('Commission updated successfully');
                this.cdr.detectChanges();
                this.commissionForm.reset();
              }
            },
            error: (error) => {
              console.error('Error updating commission:', error);
              this.toast.error(error.message || 'Error updating commission');
            }
          });

      } catch (error: any) {
        console.error('Error updating commission:', error);
        this.toast.error(error.message || 'Error updating commission');
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
        this.loadLoans(); // Refresh the list
      }
    });
  }

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
              this.loadLoans(); // Refresh the list
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

  onMerchantChange(event: any) {
    this.selectedMerchant = event.value;
    this.selectedFilter = event.value;
    this.applyFilters();
    this.createChart();
  }

  onLenderChange(event: any) {
    this.selectedLender = event.value;
    this.selectedFilter = event.value;
    this.applyFilters();
    this.createChart();
  }

  openImages(loan: any, viewOnly = false) {
    if (!loan || !loan.Id) {
      this.toast.error('Invalid loan data');
      return;
    }

    // If viewOnly is true, load images from the server first
    if (viewOnly === true) {
      this.controllers.getLoanImages(Number(loan.Id)).subscribe({
        next: (response: any) => {
          if (response) {

            for (const agent in this.groupedLoans) {
              const groupedLoan = this.groupedLoans[agent].find(l => l.Id === loan.Id.toString());
              if (groupedLoan) {
                groupedLoan.images = response;
                break; // Loan found and updated, no need to continue
              }
            }
            this.showImageDialog(loan, viewOnly); // Open the dialog
            this.cdr.detectChanges(); // Trigger change detection
          }
        },
        error: (error) => {
          console.error('Error loading images for loan', error);
          this.toast.error('Failed to load images');
        }
      });
    } else {
      this.showImageDialog(loan, viewOnly); // Open immediately if not viewOnly
    }
  }

  private showImageDialog(loan: any, viewOnly: boolean) {
    const dialogRef = this.dialog.open(LoanImagesDialogComponent, {
      width: '90%',
      maxWidth: '800px',
      data: {
        images: loan.images || [],
        loanId: loan.Id,
        viewOnly
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.controllers.uploadLoanImages(result.loanId, result.images)
          .subscribe({
            next: () => {
              this.loadLoanImages(result.loanId);
              this.toast.success('Images uploaded successfully');
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error uploading images:', error);
              this.toast.error('Failed to upload images');
            }
          });
      }
    });
  }


  loadLoanImages(loanId: number) {
    this.controllers.getLoanImages(loanId).subscribe({
      next: (response: any) => {
        if (response) {
          // Step 1: Update the loan in this.loans
          const loan = this.loans.find(l => l.Id === loanId.toString());
          if (loan) {
            loan.images = response;
          }

          // Step 2: Also update the loan in this.groupedLoans
          for (const agent in this.groupedLoans) {
            const groupedLoan = this.groupedLoans[agent].find(l => l.Id === loanId.toString());
            if (groupedLoan) {
              groupedLoan.images = response;
              break; // Loan found and updated, no need to continue
            }
          }

          this.cdr.detectChanges(); // Trigger change detection
        }
      },
      error: (error) => {
        console.error('Error loading images for loan', loanId, error);
        this.toast.error('Failed to load images');
      }
    });
  }

  singleLoanCommission(Id: string) {
    this.singleLoanCommsionObject = this.commissionDisplay.find((x: any) => x.loan_Id === Id);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  GetLoansByCustomRange(startDate: string, endDate: string) {
    this.filteredLoans = [];
    this.controllers.GetLoansByDateRange(startDate, endDate).subscribe({
      next: (response) => {
        if (response) {
          this.loans = response;
  
          this.loans = this.loans.map(loan => ({
            ...loan,
            ReceivedDate: loan.ReceivedDate == '0000-00-00 00:00:00' ? '' : loan.ReceivedDate,
            images: []
          }));
  
          // this.loans.forEach(loan => {
          //   this.loadLoanImages(loan.Id);
          // });
  
          if (this.currentUser?.role === 'admin') {
            // Group loans by agent
            this.groupedLoans = this.loans.reduce((groups: { [key: string]: any[] }, loan: any) => {
              const agent = loan.AgentName || 'Unassigned';
              if (!groups[agent]) {
                groups[agent] = [];
              }
              groups[agent].push(loan);
              return groups;
            }, {});
          } else {
            // For agents, only show their own loans
            this.loans = this.loans.filter(loan => loan.AgentName === this.currentUser.name);
          }
          this.filteredLoans = [...this.loans];
          this.filteredLoans.map(loan => {
            this.CalculateCommission(loan);
          });
          this.createChart();
          this.cdr.detectChanges();
          this.toast.success('loans fetched successfully');
        } else {
          this.toast.warning('no loans found');
        }
      },
      error: (err) => {
        this.toast.error('Error fetching loans by date range');
        console.error(err);
      }
    });
  }










}
