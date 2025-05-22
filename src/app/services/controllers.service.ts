import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  private baseUrl = 'http://localhost:8000';

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
    return this.http.post(`${this.baseUrl}/indentloan/CreateIndentLoan`, body)
  }

  UpdateIndentLoan(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/indentloan/UpdateIndentLoan/${id}`, body)
  }

  DeleteIndentLoan(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/indentloan/DeleteIndentLoan/${id}`)
  }



}
