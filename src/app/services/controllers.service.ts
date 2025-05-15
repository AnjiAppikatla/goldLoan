import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class ControllersService {
  
  private baseUrl = environment.apiUrl
  // private baseUrl = 'https://192.168.0.107';
  // private baseUrl = 'http://192.168.0.107/GoldLoanAPI';

  //for php testing local
  // private baseUrl = 'http://localhost:8000';
  
  constructor(
    private http: HttpClient,
    
  ) {
    
   }



  GetAgentById(username: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password);
    // return this.http.get<any>(`${this.baseUrl}/api/agents/GetAgentById`, { params });

    //for php testing local
    return this.http.get<any>(`${this.baseUrl}/agents/GetAgentById`, { params });
  }

  GetAllBranches(): Observable<any> {
    // return this.http.get<any>(`${this.baseUrl}/api/branch/GetAllBranches`);

    //for php testing local
    return this.http.get<any>(`${this.baseUrl}/branch/GetAllBranches`);
  }

  GetAllLenders(): Observable<any> {
    // return this.http.get<any>(`${this.baseUrl}/api/lenders/GetAllLenders`);

    //for php testing local
    return this.http.get<any>(`${this.baseUrl}/lenders/GetAllLenders`);
  }

  GetAllMerchants(): Observable<any> {
    // return this.http.get<any>(`${this.baseUrl}/api/merchants/GetAllMerchants`);

    //for php testing local
    return this.http.get<any>(`${this.baseUrl}/merchants/GetAllMerchants`);
  }

  CreateLoan(body: any): Observable<any> {
    // return this.http.post<any>(`${this.baseUrl}/api/goldloan/CreateLoan`, body);

    //for php testing local
    return this.http.post<any>(`${this.baseUrl}/goldloan/CreateLoan`, body);
  }

  GetAllLoans(): Observable<any> {
    // return this.http.get<any>(`${this.baseUrl}/api/goldloan/GetAllLoans`);

    //for php testing local
    return this.http.get<any>(`${this.baseUrl}/goldloan/GetAllLoans`);
  }

  GetAllAgents(): Observable<any> {
    // return this.http.get<any>(`${this.baseUrl}/api/agents/GetAllAgents`);

    //for php testing local
    return this.http.get<any>(`${this.baseUrl}/agents/GetAllAgents`);
  }




}
