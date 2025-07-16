import { Component, CUSTOM_ELEMENTS_SCHEMA, TemplateRef, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
// import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import { ControllersService } from '../../../services/controllers.service';
import { AuthService } from '../../../services/auth.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ToastService } from '../../../services/toastr.service';
// import { BaseChartDirective, NgChartsModule } from 'ng2-charts';

export interface Transaction {
  id: number;
  date: Date;
  type: string;
  accountNumber: string;
  amount: number;
  status: string;
  description: string;
  clinetName: string;
  branch: string;
}

export interface DenominationValue {
  value: number;
  count: number;
}

interface AgentTransaction {
  date: Date;
  amount: number;
  paymentType: string;
  clientName: string;
}

interface Agent {
  name: string;
  id: number;
  transactions: AgentTransaction[];
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
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
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {
  @ViewChild('transactionDialog') transactionDialog!: TemplateRef<any>;
  @ViewChild('PaymentDialog') PaymentDialog!: TemplateRef<any>;
  @ViewChild('transferDialog') transferDialog!: TemplateRef<any>;
  groupedCollections: { [key: string]: any[] } = {};

  clientsData: any = [
    { id: 1, name: 'client 1' },
    { id: 2, name: 'client 2' },
    { id: 3, name: 'client 3' },
    { id: 4, name: 'client 4' },
    { id: 5, name: 'client 5' },
    { id: 6, name: 'client 6' }
  ]

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

  receiptBase64: string = '';

  receiptFile: File | null = null;
  receiptPreview: string | ArrayBuffer | null = null;

  last7DaysChartCanvas: Chart| null = null

  currentUser: any;
  agents: any = []
  transactions: any = [];

  showForm = false;
  last7daysCollections: any = [];
  closeForm() {
    this.showForm = false;
  }

  onViewChange(view: 'agent' | 'client') {
    this.selectedView = view;
    setTimeout(() => this.prepareViewBasedChart(), 0); // Ensure canvas is ready
  }

  transactionTypes = [
    'Cash Deposit',
    'Cash Withdrawal',
    'Fund Transfer',
    'Bill Payment',
    'Account Opening',
    'Balance Inquiry'
  ];

  selectedType: string = '';
  amount: number = 0;
  accountNumber: string = '';
  description: string = '';

  // Add these properties
  selectedAgent: Agent | null = null;
  customerName: string = '';
  last7DaysChart?: Chart;
  clientWiseChart?: Chart;
  agentWiseChart?: Chart;

  @ViewChild('last7DaysCanvas') last7DaysCanvas!: TemplateRef<any>;
  @ViewChild('clientWiseChartCanvas') clientWiseCanvas!: TemplateRef<any>;
  @ViewChild('agentWiseChartCanvas') agentWiseCanvas!: TemplateRef<any>;

  // @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  transactionForm!: FormGroup;
  paymentForm!: FormGroup;
  transferForm!: FormGroup;

  transferObject: any = {}
  paymentObject: any = {}

  bankNames = ['SBI', 'HDFC', 'ICICI', 'AXIS'];

  denominations = [500, 200, 100, 50, 20, 10];
  selectedDenominations: { [key: number]: number } = {};

  selectedView: 'agent' | 'client' = 'agent'; // default chart for admin
  // loggedInUserRole: 'admin' | 'agent' = 'admin';

  agentsData: any = [
    { id: 1, name: 'Agent 1' },
    { id: 2, name: 'Agent 2' },
    { id: 3, name: 'Agent 3' },
  ]

  merchantsData: any = [
    { id: 1, name: 'Merchant 1' },
    { id: 2, name: 'Merchant 2' },
    { id: 3, name: 'Merchant 3' },
  ]

  // Update the resetForm method
  private resetForm() {
    this.transactionForm.reset();
  }

  // denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
  denominationValues: { [key: number]: number } = {};

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private controllers: ControllersService,
    private auth: AuthService,
    private toast: ToastService
  ) {
    this.transactionForm = this.fb.group({
      agent: ['', Validators.required],
      clientName: ['', Validators.required],
      type: ['', Validators.required],
      amount: ['', [Validators.required, Validators.required]],
      bankName: [''],
      denomination500: ['', [Validators.required, Validators.required]],
      denomination200: ['', [Validators.required, Validators.required]],
      denomination100: ['', [Validators.required, Validators.required]],
      denomination50: ['', [Validators.required, Validators.required]],
      denomination20: ['', [Validators.required, Validators.required]],
      denomination10: ['', [Validators.required, Validators.required]],
      denomination5: ['', [Validators.required, Validators.required]],
      denomination2: ['', [Validators.required, Validators.required]],
      denomination1: ['', [Validators.required, Validators.required]]
    });

    this.paymentForm = this.fb.group({
      paymentAccountName: ['', Validators.required],
      paymentAccountNumber: ['', Validators.required],
      paymentDate: ['', Validators.required],
      paymentIFSC: ['', Validators.required],
      paymentAmount: ['', Validators.required],
      paymentImage: ['', Validators.required],
    })

    this.transferForm = this.fb.group({
      transferType: ['agent'], // default selected option
      transferToAgent: [''],
      transferDate: [''],
      transferToMerchant: [''],
      fromAgent: [''],
      transfer_amount: ['']
    });

    // Subscribe to denomination changes
    this.transactionForm.get('denominations')?.valueChanges.subscribe(values => {
      if (values) {
        const total = Object.entries(values).reduce((sum, [denom, count]) => {
          return sum + (Number(denom) * Number(count));
        }, 0);
        this.transactionForm.patchValue({ amount: total }, { emitEvent: false });
      }
    });
  }

  // Add method to calculate total for each denomination
  getDenominationTotal(denomination: number): number {
    const count = this.transactionForm.get(`denominations.${denomination}`)?.value || 0;
    return denomination * count;
  }

  getAgentTotal(transactions: AgentTransaction[]): number {
    return transactions.reduce((sum, trans) => sum + trans.amount, 0);
  }


  denominationTotal: number = 0;



  // Update ngOnInit to include pie chart initialization
  ngOnInit() {
    // this.updateChartData();
    this.currentUser = this.auth.currentUserValue
    this.GetPendingCollectionsByDate(this.formatDateForController(new Date()), this.formatDateForController(new Date()));
    this.initForm();
    this.prepareViewBasedChart();
    this.GetAllAgents();
    this.GetAllMerchants();
    this.prepareViewBasedChart();
    this.getLast7DaysCollections()
    // ... rest of existing ngOnInit code ...
  }

  closeDialog() {
    this.dialog.closeAll();
    this.resetForm();
  }

  onDateRangeChange(range: string) {
    const today = new Date();
    let startDate: string, endDate: string;
  
    switch (range) {
      case 'today':
        startDate = endDate = this.formatDateForController(today);
        break;
  
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = endDate = this.formatDateForController(yesterday);
        break;
  
      case 'lastweek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - 7);
        startDate = this.formatDateForController(lastWeekStart);
        endDate = this.formatDateForController(today);
        break;
  
      case 'lastmonth':
        const lastMonthStart = new Date(today);
        lastMonthStart.setMonth(today.getMonth() - 1);
        startDate = this.formatDateForController(lastMonthStart);
        endDate = this.formatDateForController(today);
        break;
  
      case 'custom':
        return; // Wait for user to apply custom range
  
      default:
        return;
    }
  
    this.GetPendingCollectionsByDate(startDate, endDate);
  }

  applyCustomRange() {
    if (this.customStartDate && this.customEndDate) {
      const startDate = this.formatDateForController(this.customStartDate);
      const endDate = this.formatDateForController(this.customEndDate);
      this.GetPendingCollectionsByDate(startDate, endDate);
    }
  }

  GetAllAgents(){
    this.controllers.GetAllAgents().subscribe((res:any)=>{
      if(res){
        this.agentsData = res;
      }
    })
  }

  GetAllMerchants(){
    this.controllers.GetAllMerchants().subscribe((res:any)=>{
      if(res){
        this.merchantsData = res;
      }
    })
  }

  getLast7DaysCollections() {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6); // 6 days ago + today = 7 days
  
    const formattedStart = this.formatDateForController(startDate);
    const formattedEnd = this.formatDateForController(today);
  
    this.controllers.GetCollectionsByDate(formattedStart, formattedEnd).subscribe({
      next: (res: any[]) => {
        this.last7daysCollections = res;
        // this.groupedCollections = this.groupByClient(res);
        // this.getTotalCollections();        
        // this.updateChartData();
        // this.createTransactionPieChart();
        this.createLast7DaysCollectionChart(res);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  createLast7DaysCollectionChart(collections: any[]) {
    const canvas = document.getElementById('last7DaysChartCanvas') as HTMLCanvasElement;
    if (!canvas) return;
  
    // Proper destroy
    if (this.last7DaysChartCanvas) {
      this.last7DaysChartCanvas.destroy();
      this.last7DaysChartCanvas = null;
    }
  
    // Optional: Clear canvas
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7DaysMap: { [date: string]: number } = {};
  
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      last7DaysMap[key] = 0;
    }
  
    collections.forEach(col => {
      const rawDate = col.collectionDate?.split(' ')[0];
      if (last7DaysMap.hasOwnProperty(rawDate)) {
        last7DaysMap[rawDate] += Number(col.totalAmount || 0);
      }
    });
  
    const labels = Object.keys(last7DaysMap).map(dateStr => {
      const date = new Date(dateStr);
      return dayNames[date.getDay()];
    });
  
    const values = Object.values(last7DaysMap);
    const colors = this.generateUniqueColors(labels.length);
  
    this.last7DaysChartCanvas = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Total Collections',
          data: values,
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Add this to prevent stretching
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.raw as number;
                return `${ctx.label}: ₹${value.toLocaleString('en-IN')}`;
              }
            }
          }
        }
      }
    });
  }
  

  generateUniqueColors(count: number): string[] {
    const colors: string[] = [];
    const step = Math.floor(360 / count);
    for (let i = 0; i < count; i++) {
      const hue = (i * step) % 360;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  }

  // prepareLast7DaysPaymentsChart() {
  //   const days = this.getLastNDates(7); // ['2025-06-12', ..., '2025-06-18']
  //   const dailyTotals = new Map<string, number>();
  //   days.forEach(d => dailyTotals.set(d, 0));
  
  //   this.transactions.forEach((t: any) => {
  //     const rawDate = t.created_at || t.date;
  //     if (!rawDate) return;
  
  //     const parsedDate = new Date(rawDate); // ← parse properly
  //     const dateStr = this.formatDate(parsedDate); // ← format to 'YYYY-MM-DD'
  
  //     if (dailyTotals.has(dateStr)) {
  //       const current = dailyTotals.get(dateStr)!;
  //       dailyTotals.set(dateStr, current + Number(t.totalAmount || 0));
  //     }
  //   });
  
  //   this.renderBarChart(
  //     'last7DaysChartCanvas',
  //     [...dailyTotals.keys()],
  //     [...dailyTotals.values()],
  //     'Last 7 Days Commissions'
  //   );
  // }
  
  
  
  prepareAgentWisePaymentsChart() {
    const map = new Map<string, number>();
    this.transactions.forEach((t: any) => {
      const key = t.custodianName || 'Unknown'; // Assuming agent = custodianName
      map.set(key, (map.get(key) || 0) + Number(t.totalAmount || 0));
    });
    this.renderBarChart('agentWiseChartCanvas', [...map.keys()], [...map.values()], 'Agent-wise Commissions');
  }
  
  prepareClientWisePaymentsChart() {
    const map = new Map<string, number>();
    this.transactions.forEach((t: any) => {
      const key = t.clientName || 'Unknown';
      map.set(key, (map.get(key) || 0) + Number(t.totalAmount || 0));
    });
    this.renderBarChart('clientWiseChartCanvas', [...map.keys()], [...map.values()], 'Client-wise Commissions');
  }


  renderBarChart(canvasId: string, labels: string[], data: number[], label: string) {
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();
  
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) return;
  
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: this.getColorPalette(labels.length),
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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


  getColorPalette(count: number): string[] {
    const palette = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#C9CBCF', '#00A5A8', '#5C6BC0', '#8E24AA',
      '#43A047', '#FB8C00', '#D32F2F', '#1976D2', '#388E3C',
    ];
  
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }

  getLastNDates(n: number): string[] {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(this.formatDate(d));
    }
    return dates;
  }

  formatDateForController(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}-${month}`;  // format: DD-MM
  }

  initForm() {
    const denominationControls: any = {};
    this.denominations.forEach(denom => {
      denominationControls['denomination' + denom] = ['', Validators.min(0)];
    });

    this.transactionForm = this.fb.group({
      agent: ['', Validators.required],
      clientName: ['', Validators.required],
      type: ['', Validators.required],
      amount: ['', Validators.required],
      bankName: [''],
      ...denominationControls
    });

    // Subscribe to type changes
    this.transactionForm.get('type')?.valueChanges.subscribe(value => {
      if (value === 'cdm') {
        this.calculateTotal();
      }
    });
  }

  calculateTotal() {
    this.denominationTotal = this.denominations.reduce((total, denom) => {
      const count = Number(this.transactionForm.get('denomination' + denom)?.value || 0);
      return total + (denom * count);
    }, 0);

    this.transactionForm.patchValue({
      amount: this.denominationTotal
    }, { emitEvent: false });
  }



  saveTransaction() {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      console.log(formValue)
      // Create new transaction
      const newTransaction: AgentTransaction = {
        date: new Date(),
        paymentType: this.transactionForm.controls['type'].value,
        amount: this.transactionForm.controls['amount'].value,
        clientName: this.transactionForm.controls['clientName'].value,
      };

      // Check if agent exists
      const existingAgent = this.agents.find((a: Agent) => a.id === formValue.agent.id);

      if (existingAgent) {
        // Add transaction to existing agent
        if (!existingAgent.transactions) {
          existingAgent.transactions = [];
        }
        existingAgent.transactions.push(newTransaction);
      } else {
        // Create new agent with transaction
        const newAgent: Agent = {
          id: this.transactionForm.controls['agent'].value,
          name: this.transactionForm.controls['agent'].value,
          transactions: [newTransaction]
        };
        this.agents.push(newAgent);
      }

      // Handle CDM type validation
      if (formValue.type === 'cdm') {
        this.calculateTotal();
        if (this.denominationTotal !== formValue.amount) {
          alert('Denomination total does not match the amount');
          return;
        }
      }

      // Update charts

      // Close dialog and reset form
      this.closeDialog();
    }

    console.log(this.agents)
  }

  showNewTransactionForm() {
    this.resetForm();
    this.dialog.open(this.transactionDialog, {
      width: '800px'
    });
  }

  GetPendingCollectionsByDate(startDate: string, endDate: string) {
    // this.controllers.GetPendingCollectionsByDate(startDate, endDate).subscribe((res: any) => {
    this.controllers.GetCollectionsByDate(startDate, endDate).subscribe((res: any) => {
      if (res) {
        this.transactions = res;
        this.groupedCollections = this.groupByClient(res);
        this.groupedCollections = this.groupByClient(res);

        // this.prepareLast7DaysPaymentsChart();
        this.prepareViewBasedChart();
      }
    })
  }

  prepareViewBasedChart() {
    // this.prepareAgentWisePaymentsChart();
    // this.prepareClientWisePaymentsChart();

    if (this.currentUser.role === 'admin') {
      if (this.selectedView === 'agent') {
        this.prepareAgentWisePaymentsChart();
      } else {
        this.prepareClientWisePaymentsChart();
      }
    } else {
      this.prepareClientWisePaymentsChart(); // agents can only see client chart
    }
  }

  groupByClient(collections: any[]): { [key: string]: any[] } {
    // First filter collections if user is an agent
    const filteredCollections = this.currentUser?.role === 'agent' 
      ? collections.filter(collection => collection.agentName === this.currentUser.name)
      : collections;
  
    return filteredCollections.reduce((grouped: any, collection: any) => {
      const client = collection.agentName || 'Unknown Client';
      if (!grouped[client]) {
        grouped[client] = [];
      }
      grouped[client].push(collection);
      return grouped;
    }, {});
  }

  showMakePayment(transaction:any) {
    this.paymentForm.reset();
    this.paymentForm.patchValue({
      paymentAmount: transaction.cashAmount
    });
    this.paymentObject = transaction;
    const dialogRef = this.dialog.open(this.PaymentDialog, {
      width: '800px',
      data: transaction
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'save') { // Only if Save button clicked
        this.MakePayment();
        this.selectedRange = 'today';
      }
    });
  }

  showTransfer(transaction:any) {
    this.transferForm.reset();
    this.transferForm.patchValue({
      transfer_amount: transaction.cashAmount
    });
    if(this.currentUser.role === 'agent'){
      this.transferForm.patchValue({
        fromAgent: this.currentUser.name
      });
    }
    this.transferObject = transaction;
    const dialogRef = this.dialog.open(this.transferDialog, {
      width: '800px',
      data: transaction
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'save') { // Only if Save button clicked
        this.SaveTransfer();
        this.selectedRange = 'today';
      }
    });
  }

  SaveTransfer() {
    this.transferObject.transferToAgent = this.transferForm.value.transferToAgent;
    this.transferObject.transferToMerchant = this.transferForm.value.transferToMerchant;
    this.transferObject.fromAgent = this.transferForm.value.fromAgent;
    this.transferObject.transfer_amount = this.transferObject.totalAmount;
    this.transferObject.paymentStatus = 'transferred';
    this.transferObject.transferDate = this.formatDateForController(this.transferForm.value.transferDate);
  
    this.controllers.updateCollection(Number(this.transferObject.id), this.transferObject).subscribe((res: any) => {
      if (res) {
        this.toast.success('Transfer updated successfully');
        this.GetPendingCollectionsByDate(
          this.formatDateForController(new Date()),
          this.formatDateForController(new Date())
        );
        this.dialog.closeAll(); // 👈 Close dialog after save
      }
    });
  }


  MakePayment() {
    this.paymentObject.paymentAccountName = this.paymentForm.value.paymentAccountName;
    this.paymentObject.paymentAccountNumber = this.paymentForm.value.paymentAccountNumber;
    this.paymentObject.paymentIFSC = this.paymentForm.value.paymentIFSC;
    this.paymentObject.paymentAmount = this.paymentForm.value.paymentAmount;
    this.paymentObject.paymentStatus = "Completed";
    this.paymentObject.paymentDate = this.formatDateForController(this.paymentForm.value.paymentDate);
  
    if (this.receiptBase64) {
      this.paymentObject.paymentImage = this.receiptBase64; // ✅ Assign base64 string
    }
  
    this.controllers.updateCollection(Number(this.paymentObject.id), this.paymentObject).subscribe((res: any) => {
      if (res) {
        this.toast.success('Payment successful');
        this.GetPendingCollectionsByDate(
          this.formatDateForController(new Date()),
          this.formatDateForController(new Date())
        );
        this.dialog.closeAll(); // 👈 Close dialog after save
      }
    });
  }
  

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
  
    const file = input.files[0];
    const reader = new FileReader();
  
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
  
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        canvas.toBlob(blob => {
          if (blob) {
            const previewReader = new FileReader();
            previewReader.onload = () => {
              this.receiptBase64 = previewReader.result as string; // ✅ Store base64 string
              this.receiptPreview = previewReader.result;
            };
            previewReader.readAsDataURL(blob);
          }
        }, 'image/jpeg', 0.7);
      };
  
      img.src = e.target.result;
    };
  
    reader.readAsDataURL(file);
  }
  
  
  
  
  



}
