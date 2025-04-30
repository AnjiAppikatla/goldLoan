import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoldLoanService {
  private addresses: string[] = [
    'Narasaraopet, Andhra Pradesh',
    'Vizag, Andhra Pradesh',
    'Ongole, Andhra Pradesh',
    // Add more addresses
  ];

  searchAddress(term: string): Observable<string[]> {
    const filteredAddresses = this.addresses.filter(address =>
      address.toLowerCase().includes(term.toLowerCase())
    );
    return of(filteredAddresses);
  }

  public loans: any[] = [
    {
      aadharNumber: "123456789012",
      accountName: "Anji",
      accountNumber: "312321323121",
      amount: 30000,
      amountReceived: 30000,
      branchId: "123",
      cashAmount: 0,
      city: "Guntur - Arundelpet",
      commission: 0.006,
      commissionAmount: "180.00",
      commissionPercentage: 0.006,
      createdAt: "2025-04-24T17:52:12.924Z",
      ifscCode: "",
      issuedDate: "2025-04-24T17:52:03.289Z",
      leadId: "13213213",
      lender: "Bajaj",
      loanProgress: 0.00024766880293326235,
      maturityDate: "2025-06-08T18:29:59.289Z",
      merchantId: "147224577",
      mobileNo: "1233444444",
      name: "testing name 2",
      onlineAmount: 0,
      onlinePaymentType: "",
      panNumber: "",
      paymentDate: "2025-04-24T17:52:03.225Z",
      paymentReference: "",
      paymentType: "Cash",
      receivableCommission: "180.00",
      receivedBy: "Manikanta - savings",
      receivedCommissions: [],
      totalReceivedCommission: 0,
      agentName: "Manikanta",
      agentId: 2
    },
    {
      aadharNumber: "123456789012",
      accountName: "Anji",
      accountNumber: "312321323121",
      amount: 30000,
      amountReceived: 30000,
      branchId: "123",
      cashAmount: 0,
      city: "Guntur - Arundelpet",
      commission: 0.006,
      commissionAmount: "180.00",
      commissionPercentage: 0.006,
      createdAt: "2025-04-24T17:52:12.924Z",
      ifscCode: "",
      issuedDate: "2025-04-24T17:52:03.289Z",
      leadId: "13213213",
      lender: "Bajaj",
      loanProgress: 0.00024766880293326235,
      maturityDate: "2025-06-08T18:29:59.289Z",
      merchantId: "147224577",
      mobileNo: "1233444444",
      name: "testing name 2",
      onlineAmount: 0,
      onlinePaymentType: "",
      panNumber: "",
      paymentDate: "2025-04-24T17:52:03.225Z",
      paymentReference: "",
      paymentType: "Cash",
      receivableCommission: "180.00",
      receivedBy: "Manikanta - savings",
      receivedCommissions: [],
      totalReceivedCommission: 0,
      agentName: "Revathi",
      agentId: 3
    }

  ];

 public cities: { branchId: string; name: string }[] = [
    { branchId: 'VZG001', name: 'Vizag - Pendurthi' },
    { branchId: 'VZG002', name: 'Vizag - Madhurawada' },
    { branchId: 'VZG003', name: 'Vizag - Marripalem' },
    { branchId: 'VZG004', name: 'Vizag - Ravindra Nagar' },
    { branchId: 'VJW001', name: 'Vijayawada - Ajith Singh Nagar' },
    { branchId: 'VJW002', name: 'Vijayawada - Bhavanipuram' },
    { branchId: 'VJW003', name: 'Vijayawada - Eluru Road' },
    { branchId: 'VJW004', name: 'Vijayawada - Chitti Nagar' },
    { branchId: 'VJW005', name: 'Vijayawada - Satyanarayanpuram' },
    { branchId: 'VJW006', name: 'Vijayawada - Ramavarapadu' },
    { branchId: 'VJW007', name: 'Vijayawada - Ibrahimpatnam' },
    { branchId: 'VJW008', name: 'Vijayawada - Governorpet' },
    { branchId: 'GNT001', name: 'Guntur - Kothapeta' },
    { branchId: 'NLR001', name: 'Nellore - Kanakamahal Center' },
    { branchId: 'VZG005', name: 'Vizag - Old Gajuwaka' },
    { branchId: 'VZG006', name: 'Vizag - Gopalpatanam' },
    { branchId: 'VZG007', name: 'Vizag - Dwarakanagar' },
    { branchId: 'VZG008', name: 'Vizag - New Gajuwaka' },
    { branchId: 'VZG009', name: 'Vizag - Kanchara Palem' },
    { branchId: 'VZG010', name: 'Vizag - Dabagardens' },
    { branchId: 'VZG011', name: 'Vizag - Pedawaltair' },
    { branchId: 'VZG012', name: 'Vizag - Kurmannapalem' },
    { branchId: 'VZG013', name: 'Vizag - HB Colony' },
    { branchId: 'VZG014', name: 'Vizag - Akkayyapalem' },
    { branchId: 'TPT001', name: 'Tirupati - Bairagi Patteda' },
    { branchId: 'TPT002', name: 'Tirupati - Tilak Road' },
    { branchId: 'TPT003', name: 'Tirupati - Korlagunta' },
    { branchId: 'TPT004', name: 'Tirupati - RC Road' },
    { branchId: 'NLR002', name: 'Nellore - Nawabpet' },
    { branchId: 'NLR003', name: 'Nellore - Vedayapalem' },
    { branchId: 'ANK001', name: 'Anakapalle - Bhargavi Plaza' },
    { branchId: 'GNT002', name: 'Guntakal - Vegetable Market' },
    { branchId: 'KKD001', name: 'Kakinada - Jagannaickpur' },
    { branchId: 'KNL001', name: 'Kurnool - Gandhi Nagar' },
    { branchId: 'RJY001', name: 'Rajahmundry - Devi Chowk' },
    { branchId: 'RCT001', name: 'Rayachoti - Bunglow Road' },
    { branchId: 'ELR001', name: 'Eluru - Vasanth Mahal Street' },
    { branchId: 'ONG001', name: 'Ongole Addanki - Bus Stand Center' },
    { branchId: 'CRL001', name: 'Chirala - Santha Bazar' },
    { branchId: 'GNT003', name: 'Guntur - Arundelpet' },
    { branchId: 'TNL001', name: 'Tenali - Gandhi Chowk' },
    { branchId: 'NDL001', name: 'Nandyal - Srinivas Nagar' },
    { branchId: 'NSP001', name: 'Narasaraopet - Arundelpet' },
    { branchId: 'ATP001', name: 'Anantpur - Subhash Road' },
    { branchId: 'VJW009', name: 'Vijayawada - Moghalrajpuram' },
    { branchId: 'CDP001', name: 'Cuddapah - Bhagyanagar Colony' },
    { branchId: 'AMP001', name: 'Amalapuram - Main Road' },
    { branchId: 'RLW001', name: 'Railway - Koduru Nethaji Road' },
    { branchId: 'SKL001', name: 'Srikalahasti - Main Road' },
    { branchId: 'JRG001', name: 'Jangareddygudem - Eluru Main Road' },
    { branchId: 'VJW018', name: 'Vijayawada - Gurunanak Colony' },
    { branchId: 'ATP002', name: 'ANANTAPUR - KALYANDURG ROAD' },
    { branchId: 'KKD002', name: 'KAKINADA - SARPAVARAM JUNCTION' },
    { branchId: 'TGP001', name: 'Thagarapuvalasa - Bhimili Road' },
    { branchId: 'NSP002', name: 'NARSIPATNAM - MAIN ROAD' },
    { branchId: 'KDR001', name: 'KADIRI - NTR CIRCLE' },
    { branchId: 'CLP001', name: 'CHILAKALURIPET - NRT CENTER' },
    { branchId: 'BDV001', name: 'BADVEL - FOUR ROAD CIRCLE' },
    { branchId: 'RJY002', name: 'RAJAHAMUNDRY - AV APPARAO ROAD' },
    { branchId: 'BBL001', name: 'BOBBILI - PEDA BAZAAR MAIN ROAD' },
    { branchId: 'TNK001', name: 'Tanuku - Velupuru Road' },
    { branchId: 'NDG001', name: 'Nandigama - Main Road' },
    { branchId: 'BPT001', name: 'Bapatla - G B C Road' },
    { branchId: 'PNR001', name: 'Ponnur - Bus Stand' },
    { branchId: 'CTR001', name: 'Chittoor - D I Road' },
    { branchId: 'PLV001', name: 'Pulivendula - Ankalammapetta' },
    { branchId: 'GNT004', name: 'Guntur - Vinukonda' },
    { branchId: 'PVP001', name: 'Parvathipuram - RTC Bus stand' },
    { branchId: 'VZG015', name: 'Vizag - Muralinagar' },
    { branchId: 'VZG016', name: 'Vizag - Pedagantyada' },
    { branchId: 'VZG017', name: 'Vizag - MVP Colony' },
    { branchId: 'VZG018', name: 'Vizag - BGL' },
    { branchId: 'TPT005', name: 'Tirupati - BGL' },
    { branchId: 'GDV001', name: 'Gudivada - BGL' },
    { branchId: 'NLR004', name: 'Nellore - BGL' },
    { branchId: 'PDT001', name: 'Pendhurthi - Main Road' },
    { branchId: 'SBV001', name: 'Sabbavaram - Main Road' },
    { branchId: 'VZG019', name: 'Vizag - PM Palem' },
    { branchId: 'SHP001', name: 'Sriharipuram - APSRTC Depo Gate' },
    { branchId: 'VJW019', name: 'Vijayawada - Krishna Lanka' },
    { branchId: 'KVL001', name: 'Kavali - GNT Road' },
    { branchId: 'GJP001', name: 'Gajapathiagaram - Four Road Junction' }
  ];

  lenders: any[] = [
    {lenderName: 'Bajaj', id: 1, percentage: 0.006},
    {lenderName: 'HDFC', id: 2, percentage: 0.006},
    {lenderName: 'ICICI', id: 3, percentage: 0.006},
    {lenderName: 'SBI', id: 4, percentage: 0.006}
  ];
  merchants: any[] = [
    {merchantName: 'Mani', merchantid: '147224577'},
    {merchantName: 'Revathi', merchantid: '147224578'},
    {merchantName: 'Tomasri', merchantid: '147224579'},
    {merchantName: 'Kanta', merchantid: '147224580'}
  ];
  

  saveLoan(loanData: any) {
    // Initialize commission-related fields
    const newLoan = {
      ...loanData,
      receivedCommissions: [],
      totalReceivedCommission: 0,
      receivableCommission: parseFloat(loanData.commissionAmount) || 0
    };
    this.loans.push(newLoan);
    return true; // Return success status
  }

  getLoans() {
    return this.loans;
  }
  getBranches(){
    return this.cities;
  }

  addBranch(branchData: any) {
    const newBranch = {
      branchId: branchData.branchId,
      name: branchData.name,
      city: branchData.city
    };
    this.cities.push(newBranch);
    return true;
  }

  updateBranch(branchData: any) {
    const index = this.cities.findIndex(b => b.branchId === branchData.branchId);
    if (index !== -1) {
      this.cities[index] = {
        branchId: branchData.branchId,
        name: branchData.name
        // city: branchData.city
      };
      return true;
    }
    return false;
  }

  deleteBranch(branchId: string) {
    const index = this.cities.findIndex(b => b.branchId === branchId);
    if (index !== -1) {
      this.cities.splice(index, 1);
      return true;
    }
    return false;
  }

  // Lender operations
  addLender(lenderData: any) {
    const newLender = {
      lenderName: lenderData.name,
      id: this.lenders.length + 1,
      percentage: lenderData.commission
    };
    this.lenders.push(newLender);
    return true;
  }

  updateLender(lenderData: any) {
    const index = this.lenders.findIndex(l => l.lenderName === lenderData.name);
    if (index !== -1) {
      this.lenders[index] = {
        ...this.lenders[index],
        lenderName: lenderData.name,
        percentage: lenderData.commission
      };
      return true;
    }
    return false;
  }

  deleteLender(name: string) {
    const index = this.lenders.findIndex(l => l.lenderName === name);
    if (index !== -1) {
      this.lenders.splice(index, 1);
      return true;
    }
    return false;
  }

  // Merchant operations
  addMerchant(merchantData: any) {
    const newMerchant = {
      merchantName: merchantData.merchantName,
      merchantid: merchantData.merchantId,
      contactNumber: merchantData.contactNumber
    };
    this.merchants.push(newMerchant);
    return true;
  }

  updateMerchant(merchantData: any) {
    const index = this.merchants.findIndex(m => m.merchantid === merchantData.merchantId);
    if (index !== -1) {
      this.merchants[index] = {
        merchantName: merchantData.merchantName,
        merchantid: merchantData.merchantId,
        contactNumber: merchantData.contactNumber
      };
      return true;
    }
    return false;
  }

  deleteMerchant(merchantId: string) {
    const index = this.merchants.findIndex(m => m.merchantid === merchantId);
    if (index !== -1) {
      this.merchants.splice(index, 1);
      return true;
    }
    return false;
  }


  getMerchants(){
    return this.merchants;
  }
  updateMerchants(obj:any){
    return this.merchants.push(obj);
  }

  getLenders() {
    return this.lenders;
  }

  getCities(): any[] {
    return this.cities;
  }

  filterCities(searchTerm: string): Observable<any[]> {
    const filteredCities = this.cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filteredCities);
  }

  updateCommission(leadId: string, commissionData: any) {
    const loanIndex = this.loans.findIndex(loan => loan.leadId === leadId);
    if (loanIndex !== -1) {
      const loan = this.loans[loanIndex];
      const totalCommissionAmount = parseFloat(loan.commissionAmount);
      const newCommissionAmount = parseFloat(commissionData.received);
  
      // Check if new commission would exceed total commission
      if (newCommissionAmount > totalCommissionAmount) {
        throw new Error(`Total received commission cannot exceed ${totalCommissionAmount}`);
      }
  
      // Update the loan with new commission
      loan.receivedCommissions = [{
        receivedCommission: newCommissionAmount,
        receivedDate: new Date().toISOString()
      }];
  
      // Update totals (use the new commission amount directly, not adding to previous)
      loan.totalReceivedCommission = newCommissionAmount;
      loan.receivableCommission = totalCommissionAmount - newCommissionAmount;
  
      this.loans[loanIndex] = loan;
    }
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
  
    // Status logic determines the color transitions
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
    if (progress >= 90) return 'danger';
    if (progress >= 75) return 'warning';
    return 'safe';
  }

  getProgressTextClass(progress: number): string {
    if (progress >= 90) return 'text-red-600';
    if (progress >= 75) return 'text-yellow-600';
    return 'text-green-600';
  }

  updateLoans(loans: any[]) {
    this.loans = [...loans];
  }




}