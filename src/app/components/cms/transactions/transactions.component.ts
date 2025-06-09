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
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
// import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import { ControllersService } from '../../../services/controllers.service';
import { AuthService } from '../../../services/auth.service';
import { MatRadioModule } from '@angular/material/radio';
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
    MatRadioModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {
  @ViewChild('transactionDialog') transactionDialog!: TemplateRef<any>;
  groupedCollections: { [key: string]: any[] } = {};

  clientsData: any = [
    { id: 1, name: 'client 1' },
    { id: 2, name: 'client 2' },
    { id: 3, name: 'client 3' },
    { id: 4, name: 'client 4' },
    { id: 5, name: 'client 5' },
    { id: 6, name: 'client 6' }
  ]

  currentUser: any;
  agents: any = []
  transactions: any = [];

  showForm = false;
  closeForm() {
    this.showForm = false;
  }

  onViewChange(view: 'agent' | 'client') {
    this.selectedView = view;
    this.prepareViewBasedChart();
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
    private auth: AuthService
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
    this.GetAllPendingPayments();
    this.initForm();
    this.prepareViewBasedChart()
    // ... rest of existing ngOnInit code ...
  }

  closeDialog() {
    this.dialog.closeAll();
    this.resetForm();
  }

  prepareLast7DaysPaymentsChart() {
    const days = this.getLastNDates(7);
    const dailyTotals = new Map<string, number>();
    days.forEach(d => dailyTotals.set(d, 0));

    this.transactions.forEach((t: any) => {
      const dateStr = this.formatDate(t.date);
      if (dailyTotals.has(dateStr)) {
        dailyTotals.set(dateStr, dailyTotals.get(dateStr)! + t.amount);
      }
    });

    this.renderBarChart('last7DaysChartCanvas', [...dailyTotals.keys()], [...dailyTotals.values()], 'Last 7 Days Payments');
  }

  prepareAgentWisePaymentsChart() {
    const map = new Map<string, number>();
    this.transactions.forEach((t: any) => {
      const key = t.agentName || 'Unknown';
      map.set(key, (map.get(key) || 0) + t.amount);
    });
    this.renderBarChart('agentWiseChartCanvas', [...map.keys()], [...map.values()], 'Agent-wise Payments');
  }

  prepareClientWisePaymentsChart() {
    const map = new Map<string, number>();
    this.transactions.forEach((t: any) => {
      const key = t.clinetName || 'Unknown';
      map.set(key, (map.get(key) || 0) + t.amount);
    });
    this.renderBarChart('clientWiseChartCanvas', [...map.keys()], [...map.values()], 'Client-wise Payments');
  }


  renderBarChart(canvasId: string, labels: string[], data: number[], label: string) {
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();

    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: labels.map(() => this.getRandomColor()),
          barThickness: 30,
          maxBarThickness: 35
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => `₹${ctx.raw}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: val => `₹${val}`
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

  getLastNDates(n: number): string[] {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(this.formatDate(d));
    }
    return dates;
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

  GetAllPendingPayments() {
    this.controllers.getPendingCollection().subscribe((res: any) => {
      if (res) {
        this.transactions = res;
        this.groupedCollections = this.groupByClient(res);
        this.groupedCollections = this.groupByClient(res);

        this.prepareLast7DaysPaymentsChart();
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
    return collections.reduce((grouped: any, collection: any) => {
      const client = collection.clientName || 'Unknown Client';
      if (!grouped[client]) {
        grouped[client] = [];
      }
      grouped[client].push(collection);
      return grouped;
    }, {});
  }



}
