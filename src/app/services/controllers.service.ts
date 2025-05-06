import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControllersService {
  private baseUrl = 'http://192.168.0.107/GoldLoanAPI';

  constructor(
    private http: HttpClient
  ) { }


  GetAgentById(username: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);
    return this.http.get<any>(`${this.baseUrl}/api/agents/GetAgentById`, { params });
  }

  GetAllBranches(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/branch/GetAllBranches`);
  }

  GetAllLenders(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/lenders/GetAllLenders`);
  }

  GetAllMerchants(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/merchants/GetAllMerchants`);
  }

  CreateLoan(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/goldloan/CreateLoan`, body);
  }

  GetAllLoans(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/goldloan/GetAllLoans`);
  }

  GetAllAgents(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/agents/GetAllAgents`);
  }




}
