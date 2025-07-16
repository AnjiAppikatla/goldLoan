import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormControl, FormControlName, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChartConfiguration, ChartData } from 'chart.js';
// import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ControllersService } from '../../../services/controllers.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toastr.service';
import { Chart } from 'chart.js/auto';
import { MatDatepickerModule } from '@angular/material/datepicker';

// Update the Collection interface to include time
interface Collection {

  collectionType: string,
  clientName: string,
  totalAmount: 0,
  cashAmount: 0,
  onlineAmount: 0,
  onlineType: '',
  date: Date;
  time?: string;
  denomination500: string,
  denomination200: string,
  denomination100: string,
  denomination50: string,
  denomination20: string,
  denomination10: string,
  denomination5: string,
  denomination2: string,
  denomination1: string
}

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    // NgChartsModule,
    MatExpansionModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatDatepickerModule
  ],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss'
})
export class CollectionsComponent implements OnInit {

  @ViewChild('collectionDialog') collectionDialog!: TemplateRef<any>;

  currentUser: any;
  groupedCollections: { [key: string]: any[] } = {};
  merchants: any;
  last7daysCollections: any = [];

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


  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private controllers: ControllersService,
    private authService: AuthService,
    private toast: ToastService
  ) { }
  private collectionChart: Chart | null = null;
  // @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  
  collectionTypes = ['All', 'Cash', 'Online'];

  collectionTypesTotal = [
    { name: 'Cash', value: 0 },
    { name: 'Online', value: 0 }
  ];

  selectedTypeFc = new FormControl('All')

  collectionTotalAmount: number = 0;

  selectedClient: string = 'All';

  employees = [
    { id: 1, name: 'Agent Mike' },
    { id: 2, name: 'Agent Lisa' },
    { id: 3, name: 'Agent John' },
    { id: 4, name: 'Agent Sarah' },
    { id: 5, name: 'Admin' }
  ];


  collectionGrop!: FormGroup;

  cashAmountRow: boolean = false
  onlineAmountRow: boolean = false;
  totalCash: number = 0;
  totalOnlineCash: number = 0;

  transactionChart: Chart | null = null; // Declare this in the component
  last7DaysCollectionChart: Chart | null = null; // Declare this in the component

  // ngAfterViewInit(): void {
  //   this.createTransactionBarChart();
  // }

  public barChartData: ChartData<'bar'> = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56],
        label: 'Collections',
        backgroundColor: 'rgba(0,123,255,0.6)'
      }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  collections: Collection[] = [];

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue
    this.GetAllCollections(this.formatDate(new Date()), this.formatDate(new Date()));
    this.updateChartData();
    this.GetAllClients();
    this.getLast7DaysCollections();

    //clientName, custodianName, commissionPercentage, commission, collectionType, denomination, agentName, cashAmount, onlineAmount, onlineType, accountName, mobileNumber, paymentStatus, paymentAccountName, paymentAccountNumber, paymentIFSC, paymentAmount, paymentImage, transferToAgent, transferToMerchant, fromAgent,

    this.collectionGrop = new FormGroup({
      collectionType: new FormControl('', Validators.required),
      collectionDate: new FormControl('', Validators.required),
      clientName: new FormControl('', Validators.required),
      custodianName: new FormControl('', Validators.required),
      merchantid: new FormControl('', Validators.required),
      totalAmount: new FormControl('', Validators.required),
      cashAmount: new FormControl('', Validators.required),
      onlineAmount: new FormControl('', Validators.required),
      onlineType: new FormControl('', Validators.required),
      accountName: new FormControl('', Validators.required),
      mobileNumber: new FormControl('', Validators.required),
      denomination500: new FormControl('', Validators.required),
      denomination200: new FormControl('', Validators.required),
      denomination100: new FormControl('', Validators.required),
      denomination50: new FormControl('', Validators.required),
      denomination20: new FormControl('', Validators.required),
      denomination10: new FormControl('', Validators.required),
      denomination5: new FormControl('', Validators.required),
      denomination2: new FormControl('', Validators.required),
      denomination1: new FormControl('', Validators.required),
    })
  }

  onTypeChange(type: string) {
    this.selectedTypeFc.setValue(type);
    this.updateChartData();
  }

  collectionTypeChange(event: any) {
    this.cashAmountRow = false;
    this.onlineAmountRow = false;
    if (event.value == 'Cash') {
      this.cashAmountRow = true
      this.onlineAmountRow = false
    }
    else if (event.value == 'Online') {
      this.cashAmountRow = false
      this.onlineAmountRow = true
    }
    else if (event.value == 'cash&online') {
      this.cashAmountRow = true
      this.onlineAmountRow = true
    }
  }

  private updateChartData() {
    let filteredData = this.collections;
    
    if (this.selectedTypeFc.value !== 'All') {
      filteredData = this.collections.filter(c => {
        if (this.selectedTypeFc.value === 'Cash') {
          return c.cashAmount > 0;
        } else if (this.selectedTypeFc.value === 'Online') {
          return c.onlineAmount > 0;
        }
        return c.collectionType === this.selectedTypeFc.value;
      });
    }
  
    this.barChartData.datasets[0].data = filteredData.map(c => {
      if (this.selectedTypeFc.value === 'Cash') {
        return c.cashAmount;
      } else if (this.selectedTypeFc.value === 'Online') {
        return c.onlineAmount;
      }
      return c.totalAmount;
    });
    
    // this.chart?.update();
  }

  // // Add this method to the component class
  // getTypeTotal(type: string): number {
  //   return this.collections
  //     .filter(c => c.collectionType === type)
  //     .reduce((sum, item) => sum + item.totalAmount, 0);
  // }

  getTotalCollections() {
    // Reset totals before calculating
    this.totalCash = 0;
    this.totalOnlineCash = 0;

    // Calculate totals with number conversion
    this.collections.forEach(x => {
      this.totalCash += Number(x.cashAmount) || 0;
      this.totalOnlineCash += Number(x.onlineAmount) || 0;
    });

    // Update collection types total
    this.collectionTypesTotal.forEach(y => {
      if (y.name === 'Cash') {
        y.value = this.totalCash;
      }
      else if (y.name === 'Online') {
        y.value = this.totalOnlineCash;
      }
    });

    // Calculate total amount
    this.collectionTotalAmount = Number(this.totalCash) + Number(this.totalOnlineCash);

    return this.collectionTotalAmount;
  }

  getCollectionsByType(type: string): any[] {
    return this.collections.filter(c => c.collectionType === type);
  }

  showForm = false;

  clients:any = [];
  custodians:any = [];

  paymentMethods = {
    'Online': ['PhonePe', 'Google Pay', 'PayTM', 'UPI', 'Net Banking'],
    'Cash': ['Cash']
  };

  denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
  selectedDenominations: { [key: string]: number } = {};

  // Update initial newCollection
  newCollection: Collection = {
    collectionType: '',
    clientName: '',
    totalAmount: 0,
    cashAmount: 0,
    onlineAmount: 0,
    onlineType: '',
    date: new Date,
    time: new Date().toLocaleTimeString(),
    denomination500: '',
    denomination200: '',
    denomination100: '',
    denomination50: '',
    denomination20: '',
    denomination10: '',
    denomination5: '',
    denomination2: '',
    denomination1: ''
  };

  showNewCollectionForm() {
    this.resetForm();
    this.dialog.open(this.collectionDialog, {
      width: '800px',
      disableClose: true
    });
  }

  closeDialog() {
    this.resetForm();
    this.dialog.closeAll();
  }

  createTransactionPieChart() {
    const canvas = document.getElementById('transactionsBarChart') as HTMLCanvasElement;
    if (!canvas) return;
  
    if (this.transactionChart) {
      this.transactionChart.destroy();
    }
  
    const totalsByClient = new Map<string, number>();
    this.collections.forEach(c => {
      const key = c.clientName || 'Unknown';
      const total = Number(c.totalAmount || 0);
      totalsByClient.set(key, (totalsByClient.get(key) || 0) + total);
    });
  
    const labels = [...totalsByClient.keys()];
    const data = [...totalsByClient.values()];
  
    this.transactionChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Total Collections',
          data,
          backgroundColor: this.getColorPalette(labels.length)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: context => `${context.label}: ₹${context.raw}`
            }
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  getColorPalette(count: number): string[] {
    const palette = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8E44AD', '#C9CBCF'];
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }
  

  saveCollection() {  
    let denomination = ''
     if(this.collectionGrop.controls['denomination500'].value !== '' || this.collectionGrop.controls['denomination500'].value !== null){
       denomination = denomination + `500_` + this.collectionGrop.controls['denomination500'].value + ';'
     }
     if(this.collectionGrop.controls['denomination200'].value !== '' || this.collectionGrop.controls['denomination200'].value !== null){
      denomination = denomination + `200_` + this.collectionGrop.controls['denomination200'].value + ';'
     }
     if(this.collectionGrop.controls['denomination100'].value !== '' || this.collectionGrop.controls['denomination100'].value !== null){
      denomination = denomination + `100_` + this.collectionGrop.controls['denomination100'].value + ';'
     }
     if(this.collectionGrop.controls['denomination50'].value !== '' || this.collectionGrop.controls['denomination50'].value !== null){
      denomination = denomination + `50_` + this.collectionGrop.controls['denomination50'].value + ';'
     }
     if(this.collectionGrop.controls['denomination20'].value !== '' || this.collectionGrop.controls['denomination20'].value !== null){
      denomination = denomination + `20_` + this.collectionGrop.controls['denomination20'].value + ';'
     }
     if(this.collectionGrop.controls['denomination10'].value !== '' || this.collectionGrop.controls['denomination10'].value !== null){
      denomination = denomination + `10_` + this.collectionGrop.controls['denomination10'].value + ';'
     }
     if(this.collectionGrop.controls['denomination5'].value !== '' || this.collectionGrop.controls['denomination5'].value !== null){
      denomination = denomination + `5_` + this.collectionGrop.controls['denomination5'].value + ';'
     }
     if(this.collectionGrop.controls['denomination2'].value !== '' || this.collectionGrop.controls['denomination2'].value !== null){
      denomination = denomination + `2_` + this.collectionGrop.controls['denomination2'].value + ';'
     }
     if(this.collectionGrop.controls['denomination1'].value !== '' || this.collectionGrop.controls['denomination1'].value!== null){
      denomination = denomination + `1_` + this.collectionGrop.controls['denomination1'].value
     }

         //clientName, custodianName, commissionPercentage, commission, collectionType, denomination, agentName, cashAmount, onlineAmount, onlineType, accountName, mobileNumber, paymentStatus, paymentAccountName, paymentAccountNumber, paymentIFSC, paymentAmount, paymentImage, transferToAgent, transferToMerchant, fromAgent,

    const obj = Object.assign({})
    obj.collectionType = this.collectionGrop.controls['collectionType'].value,
    obj.clientName = this.collectionGrop.controls['clientName'].value,
    obj.custodianName = this.collectionGrop.controls['custodianName'].value,
    obj.commissionPercentage = this.clients.find((x:any) => x.clientName == this.collectionGrop.controls['clientName'].value).percentage,
    obj.denomination = denomination,
    // obj.commission = this.collectionGrop.controls['commission'].value,
    obj.agentName = this.currentUser.name,
    obj.merchantid = this.collectionGrop.controls['merchantid'].value,
    obj.accountName = this.collectionGrop.controls['accountName'].value,
    obj.mobileNumber = this.collectionGrop.controls['mobileNumber'].value,
    obj.collectionDate = this.formatDate(this.collectionGrop.controls['collectionDate'].value),
    // obj.date = new Date(),
    // obj.time = new Date().toLocaleTimeString();
    obj.commission = this.collectionGrop.controls['totalAmount'].value * this.clients.find((x:any) => x.clientName == this.collectionGrop.controls['clientName'].value).percentage

    if (this.collectionGrop.controls['collectionType'].value == 'Cash') {      
        obj.cashAmount = this.collectionGrop.controls['cashAmount'].value,
        obj.totalAmount = this.collectionGrop.controls['cashAmount'].value
    }

    if(this.collectionGrop.controls['collectionType'].value == 'cash&online'){
      obj.totalAmount = this.collectionGrop.controls['cashAmount'].value + this.collectionGrop.controls['onlineAmount'].value,
      obj.onlineAmount = this.collectionGrop.controls['onlineAmount'].value
      obj.cashAmount = this.collectionGrop.controls['cashAmount'].value
      obj.onlineType = this.collectionGrop.controls['onlineType'].value
    }

    if (this.collectionGrop.controls['collectionType'].value == 'Online') {
      obj.totalAmount = this.collectionGrop.controls['onlineAmount'].value,
        obj.onlineAmount = this.collectionGrop.controls['onlineAmount'].value,
        obj.onlineType = this.collectionGrop.controls['onlineType'].value,
        obj.accountName = this.collectionGrop.controls['accountName'].value,
        obj.mobileNumber = this.collectionGrop.controls['mobileNumber'].value,
        obj.commission = this.collectionGrop.controls['onlineAmount'].value * this.clients.find((x:any) => x.clientName == this.collectionGrop.controls['clientName'].value).percentage
    }

    this.controllers.createCollection(obj).subscribe((res:any) => {
      if(res){
        this.toast.success('Collection created successfully')
        // this.collections = res;
        this.GetAllCollections(this.formatDate(new Date()), this.formatDate(new Date()));
        this.getTotalCollections();
        this.updateChartData();
        this.createTransactionPieChart();
        this.getLast7DaysCollections();
      }
      else{
        this.toast.error('Something went wrong')
      }
    })

    // this.collections.push(obj);

    this.getTotalCollections();

    this.closeDialog();
    this.updateChartData();
  }

  formatDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  getLast7DaysCollections() {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6); // 6 days ago + today = 7 days
  
    const formattedStart = this.formatDate(startDate);
    const formattedEnd = this.formatDate(today);
  
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

  // Remove showForm, closeForm, and onSubmit methods as they're no longer needed
  // Add resetForm method
  // Update resetForm method
  resetForm() {
    this.collectionGrop.reset();
    this.selectedDenominations = {};
    this.cashAmountRow = false;
    this.onlineAmountRow = false;
  }

  getUniqueClients(): string[] {
    return [...new Set(this.collections.map(c => c.clientName))];
  }

  getClientTotal(clientName: string): number {
    return this.collections
      .filter(c => c.clientName === clientName)
      .reduce((sum, item) => sum + item.totalAmount, 0);
  }

  getCollectionsByClient(clientName: string): Collection[] {
    return this.collections.filter(c => c.clientName === clientName);
  }

  // Add to your component class
  updateCashAmount() {
    const denominations = {
      500: this.collectionGrop.get('denomination500')?.value || 0,
      200: this.collectionGrop.get('denomination200')?.value || 0,
      100: this.collectionGrop.get('denomination100')?.value || 0,
      50: this.collectionGrop.get('denomination50')?.value || 0,
      20: this.collectionGrop.get('denomination20')?.value || 0,
      10: this.collectionGrop.get('denomination10')?.value || 0,
      5: this.collectionGrop.get('denomination5')?.value || 0,
      2: this.collectionGrop.get('denomination2')?.value || 0,
      1: this.collectionGrop.get('denomination1')?.value || 0
    };

    const total = Object.entries(denominations)
      .reduce((sum, [denom, count]) => sum + (Number(denom) * count), 0);

    this.collectionGrop.patchValue({
      cashAmount: total
    }, { emitEvent: false });

    // this.updateAmounts();
  }

  validateNumber(event: any) {
    const input = event.target;
    let value = input.value.replace(/[^0-9]/g, '');
    value = value === '' ? '0' : value;
    input.value = value;
  }


  getCashTotal(): number {
    if (this.newCollection.collectionType !== 'Cash') return 0;
    return Object.entries(this.selectedDenominations)
      .reduce((sum, [denom, count]) => sum + (Number(denom) * (count || 0)), 0);
  }

  getOnlineTotal(): number {
    return this.newCollection.collectionType === 'Online' ? this.newCollection.totalAmount : 0;
  }

  getTotalAmount(): number {
    return this.getCashTotal() + this.getOnlineTotal();
  }

  needsOnlinePayment(): boolean {
    return this.newCollection.totalAmount > this.getCashTotal();
  }

  getRemainingAmount(): number {
    const remaining = this.newCollection.totalAmount - this.getCashTotal();
    return remaining > 0 ? remaining : 0;
  }

  updateAmounts() {
    const totalAmount = this.collectionGrop.get('totalAmount')?.value || 0;
    const cashAmount = this.collectionGrop.get('cashAmount')?.value || 0;
    // const onlineAmount = totalAmount - cashAmount;

    // this.collectionGrop.patchValue({
    //   onlineAmount: onlineAmount >= 0 ? onlineAmount : 0
    // }, { emitEvent: false });
  }

  isValidTotal(): boolean {
    if (this.newCollection.collectionType === 'Cash') {
      const isValid = this.newCollection.totalAmount > 0 &&
        this.getCashTotal() <= this.newCollection.totalAmount;
      if (this.needsOnlinePayment()) {
        return isValid && !!this.newCollection.onlineType;
      }
      return isValid;
    }
    return this.newCollection.totalAmount > 0;
  }

  createChart(){
    if(this.collectionChart){
      this.collectionChart.destroy();
    }

    const canvas = document.getElementById('collectionchart') as HTMLCanvasElement;
    if (!canvas) {
        setTimeout(() => this.createChart(), 100);
        return;
    }

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
  ];

  }


  GetAllClients(){
    this.controllers.getAllClients().subscribe({
      next: (res: any) => {
        this.clients = res;
        this.GetAllCustodians();
        this.GetAllMerchants();
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  GetAllMerchants(){
    this.controllers.GetAllMerchants().subscribe({
      next: (res: any) => {
        this.merchants = res;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  GetAllCustodians(){
    this.controllers.getAllCustodians().subscribe({
      next: (res: any) => {
        this.custodians = res;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  GetAllCollections(startDate: string, endDate: string) {
    this.controllers.GetCollectionsByDate(startDate, endDate).subscribe({
      next: (res: any[]) => {
        this.collections = res;
        this.groupedCollections = this.groupByClient(res);
        this.getTotalCollections();        
        this.updateChartData();
        this.createTransactionPieChart();
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  GetCollectionsByDate(){

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

  onDateRangeChange(range: string) {
    const today = new Date();
    let startDate: string, endDate: string;
  
    switch (range) {
      case 'today':
        startDate = endDate = this.formatDate(today);
        break;
  
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = endDate = this.formatDate(yesterday);
        break;
  
      case 'lastweek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - 7);
        startDate = this.formatDate(lastWeekStart);
        endDate = this.formatDate(today);
        break;
  
      case 'lastmonth':
        const lastMonthStart = new Date(today);
        lastMonthStart.setMonth(today.getMonth() - 1);
        startDate = this.formatDate(lastMonthStart);
        endDate = this.formatDate(today);
        break;
  
      case 'custom':
        return; // Wait for user to apply custom range
  
      default:
        return;
    }
  
    this.GetAllCollections(startDate, endDate);
  }

  applyCustomRange() {
    if (this.customStartDate && this.customEndDate) {
      const startDate = this.formatDate(this.customStartDate);
      const endDate = this.formatDate(this.customEndDate);
      this.GetAllCollections(startDate, endDate);
    }
  }

  createLast7DaysCollectionChart(collections: any[]) {
    const canvas = document.getElementById('last7DaysCollectionChart') as HTMLCanvasElement;
    if (!canvas) return;
  
    if (this.last7DaysCollectionChart) {
      this.last7DaysCollectionChart.destroy();
    }
  
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7DaysMap: { [date: string]: number } = {};
  
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
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
  
    this.last7DaysCollectionChart = new Chart(canvas, {
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
  
  
  
  
  


}
