import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// export interface Agent {
//   id: number;
//   username: string;
//   password: string;
//   // Add other relevant fields
// }

// export interface Branch {
//   id: number;
//   name: string;
//   // Add other relevant fields
// }

// export interface Lender {
//   id: number;
//   name: string;
//   // Add other relevant fields
// }

// export interface Merchant {
//   id: number;
//   name: string;
//   // Add other relevant fields
// }

// export interface Loan {
//   id: number;
//   amount: number;
//   // Add other relevant fields
// }

@Injectable({
  providedIn: 'root'
})
export class ControllersService {

  // private baseUrl = 'http://localhost:8000';
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  GetAgentById(username: string, password: string): Observable<any> {
    const params = new HttpParams().set('username', username).set('password', password);
    return this.http.get<any>(`${this.baseUrl}/agents/GetAgentById`, { params });
  }

  CreateAgent(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agents/CreateAgent`, body)
  }

  UpdateAgent(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/UpdateAgent/${id}`, body)
  }

  LoginAgent(body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/LoginAgent`, body)
  }

  LogoutAgent(body:any,id:number): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/LogoutAgent/${id}`, body)
  }
  
  DeleteAgent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/agents/DeleteAgent/${id}`)
  }


  GetAllAgents(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/agents/GetAllAgents`)
  }

  CreateBranch(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/branch/CreateBranch`, body)
  }

  UpdateBranch(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/branch/UpdateBranch/${id}`, body)
  }

  DeleteBranch(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/branch/DeleteBranch/${id}`)
  }

  GetAllBranches(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/branch/GetAllBranches`)
  }

  CreateLender(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/lenders/CreateLender`, body)
  }

  UpdateLender(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/lenders/UpdateLender/${id}`, body)
  }

  DeleteLender(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/lenders/DeleteLender/${id}`)
  }

  GetAllLenders(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/lenders/GetAllLenders`)
  }

  CreateMerchant(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/merchants/CreateMerchant`, body)
  }

  UpdateMerchant(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/merchants/UpdateMerchant/${id}`, body)
  }

  DeleteMerchant(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/merchants/DeleteMerchant/${id}`)
  }

  GetAllMerchants(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/merchants/GetAllMerchants`)
  }

  CreateLoan(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/goldloan/CreateLoan`, body)
  }

  UpdateLoan(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/goldloan/UpdateLoan/${id}`, body)
  }

  DeleteLoan(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/goldloan/DeleteLoan/${id}`)
  }

  GetAllLoans(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/goldloan/GetAllLoans`)
  }

  GetAllIndentLoans():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/indentloans/GetAllIndentLoans`)
  }

  CreateIndentLoan(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/indentloans/CreateIndentLoan`, body)
  }

  UpdateIndentLoan(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/indentloans/UpdateIndentLoan/${id}`, body)
  }

  DeleteIndentLoan(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/indentloans/DeleteIndentLoan/${id}`)
  }

  UpdateCommission(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/goldloan/UpdateCommission/${id}`, body)
  }

  GetAllBankDetails():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/bankdetails/GetAllBankDetails`)
  }

  CreateBankDetails(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bankdetails/CreateBankDetails`, body)
  }

  UpdateBankDetails(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/bankdetails/UpdateBankDetails/${id}`, body)
  }
  
  DeleteBankDetails(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/bankdetails/DeleteBankDetails/${id}`)
  }

  uploadLoanImages(loanId: number, images: any[]): Observable<any> {
    const formData = new FormData();
    formData.append('loan_id', loanId.toString());
    formData.append('total_images', images.length.toString());
  
    images.forEach((image, index) => {
      formData.append(`image_data_${index}`, image.data); // Already base64 from dialog
      formData.append(`image_name_${index}`, image.name);
      formData.append(`image_type_${index}`, image.type);
      formData.append(`created_at_${index}`, image.created_at);
    });
  
    return this.http.post(`${this.baseUrl}/loan_images/UploadLoanImages/${loanId}`, formData);
  }

  getLoanImages(loanId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/loan_images/GetLoanImages/${loanId}`);
  }

  deleteImage(imageId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/loan_images/DeleteImage/${imageId}`);
  }


  



}
