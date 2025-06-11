import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, from, Observable, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class ControllersService {

  private sessionToken = new BehaviorSubject<string | null>(null);
  private isTokenValid = new BehaviorSubject<boolean>(false);
  private token: string | null = null;

  // private baseUrl = 'http://localhost:8000';
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
    this.token = localStorage.getItem('token');
    // if (this.token) {
    //   this.validateToken(this.token);
    // }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // private validateToken(token: string): void {
  //   this.http.post(`${this.baseUrl}/validate-token`, { token }, {
  //     headers: this.getHeaders()
  //   }).subscribe({
  //     next: () => this.isTokenValid.next(true),
  //     error: () => {
  //       this.isTokenValid.next(false);
  //       this.clearToken();
  //     }
  //   });
  // }

  public getTokenValidity(): Observable<boolean> {
    return this.isTokenValid.asObservable();
  }

  public setToken(token: string): void {
    localStorage.setItem('sessionToken', token);
    this.sessionToken.next(token);
    // this.validateToken(token);
  }

  public clearToken(): void {
    localStorage.removeItem('token');
    this.token = null;
    this.isTokenValid.next(false);
  }

  private handleError(error: any) {
    if (error.status === 401) {
      this.router.navigate(['/login']);
      // Token is invalid or expired
      // this.token = null;
      // localStorage.removeItem('token');
      // You might want to redirect to login page here
    }
    return throwError(() => error);
  }

  GetAgentById(username: string, password: string): Observable<any> {
    const params = new HttpParams().set('username', username).set('password', password);
    return this.http.get<any>(`${this.baseUrl}/agents/GetAgentById`, { params });
  }

  CreateAgent(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agents/CreateAgent`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  UpdateAgent(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/UpdateAgent/${id}`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  LoginAgent(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agents/LoginAgent`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  LogoutAgent(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/LogoutAgent/${id}`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  
  DeleteAgent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/agents/DeleteAgent/${id}`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }


  GetAllAgents(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/agents/GetAllAgents`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  CreateBranch(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/branch/CreateBranch`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  UpdateBranch(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/branch/UpdateBranch/${id}`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  DeleteBranch(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/branch/DeleteBranch/${id}`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  GetAllBranches(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/branch/GetAllBranches`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  CreateLender(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/lenders/CreateLender`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  UpdateLender(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/lenders/UpdateLender/${id}`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  DeleteLender(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/lenders/DeleteLender/${id}`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  GetAllLenders(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/lenders/GetAllLenders`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  CreateMerchant(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/merchants/CreateMerchant`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  UpdateMerchant(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/merchants/UpdateMerchant/${id}`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  DeleteMerchant(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/merchants/DeleteMerchant/${id}`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  GetAllMerchants(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/merchants/GetAllMerchants`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  CreateLoan(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/goldloan/CreateLoan`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  UpdateLoan(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/goldloan/UpdateLoan/${id}`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  DeleteLoan(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/goldloan/DeleteLoan/${id}`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  GetLoansByMonth(month: number, year: number):Observable<any> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
  
    const headers = this.getHeaders(); // assuming you already have this method
  
    return this.http.get<any[]>(`${this.baseUrl}/goldloan/GetLoansByMonth`, {
      params,
      headers
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  GetLoansByDateRange(startDate: string, endDate: string):Observable<any>  {
    
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    const headers = this.getHeaders(); // assuming you already have this method

    return this.http.get<any[]>(`${this.baseUrl}/goldloan/GetLoansByDateRange`, {
      params,
      headers      
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  GetAllLoans(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/goldloan/GetAllLoans`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  GetAllIndentLoans():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/indentloans/GetAllIndentLoans`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  CreateIndentLoan(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/indentloans/CreateIndentLoan`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  UpdateIndentLoan(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/indentloans/UpdateIndentLoan/${id}`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  DeleteIndentLoan(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/indentloans/DeleteIndentLoan/${id}`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  UpdateCommission(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/goldloan/UpdateCommission/${id}`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  GetAllBankDetails():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/bankdetails/GetAllBankDetails`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  CreateBankDetails(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bankdetails/CreateBankDetails`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  UpdateBankDetails(body: any, id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/bankdetails/UpdateBankDetails/${id}`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  
  DeleteBankDetails(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/bankdetails/DeleteBankDetails/${id}`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  uploadLoanImages(loanId: number, images: any[]): Observable<any> {
    const formData = new FormData();
    formData.append('loan_id', loanId.toString());
    formData.append('total_images', images.length.toString());
  
    images.forEach((image, index) => {
      formData.append(`image_data_${index}`, image.data); // base64 string
      formData.append(`image_name_${index}`, image.image_name);
      formData.append(`image_type_${index}`, image.image_type);
      formData.append(`created_at_${index}`, image.created_at);
    });
  
    // ✅ Add headers here
    return this.http.post(`${this.baseUrl}/loan_images/UploadLoanImages/${loanId}`, formData);
  }
  

  getLoanImages(loanId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/loan_images/GetLoanImages/${loanId}`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteImage(imageId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/loan_images/DeleteImage/${imageId}`,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  RefreshToken(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agents/RefreshToken`, body,{
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
     )
  }

  getAllCollections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections/GetAllCollections`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getCollectionById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections/GetCollectionById/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  GetCollectionsByDate(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get(`${this.baseUrl}/collections/GetCollectionsByDate`, { params, headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getPendingCollection(): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections/GetPendingCollections`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createCollection(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/collections/CreateCollection`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateCollection(id: number, body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/collections/UpdateCollection/${id}`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteCollection(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/collections/DeleteCollection/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // ====== Wallet CRUD ======

  getWallets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/wallets`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getWalletById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/wallets/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createWallet(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/wallets/CreateWallet`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateWallet(id: number, body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/wallets/${id}`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteWallet(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/wallets/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllCustodians(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/custodian/GetAllCustodians`, { headers: this.getHeaders() })
  }

  getCustodianById(id: number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/custodian/GetCustodianById/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createCustodian(custodian: any): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/custodian/CreateCustodian`, custodian, { headers: this.getHeaders() })
  }

  updateCustodian(id: number, custodian: any): Observable<any> {
    return this.http
      .put(`${this.baseUrl}/custodian/UpdateCustodian/${id}`, custodian, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteCustodian(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/custodian/DeleteCustodian/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

    // GET all clients
    getAllClients(): Observable<any> {
      return this.http.get(`${this.baseUrl}/clients/GetAllClients`, { headers: this.getHeaders() })
        .pipe(catchError(this.handleError));
    }
  
    // GET client by ID
    getClientById(id: number): Observable<any> {
      return this.http.get(`${this.baseUrl}/clients/GetClientById?id=${id}`, { headers: this.getHeaders() })
        .pipe(catchError(this.handleError));
    }
  
    // POST - create new client
    createClient(client: { clientName: string; percentage: number }): Observable<any> {
      return this.http.post(`${this.baseUrl}/clients/CreateClient`, client, { headers: this.getHeaders() })
        .pipe(catchError(this.handleError));
    }
  
    // PUT - update client by id
    updateClient(id: number, client: { clientName: string; percentage: number }): Observable<any> {
      return this.http.put(`${this.baseUrl}/clients/UpdateClient/${id}`, client, { headers: this.getHeaders() })
        .pipe(catchError(this.handleError));
    }
  
    // DELETE - delete client by id
    deleteClient(id: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}/clients/DeleteClient/${id}`, { headers: this.getHeaders() })
        .pipe(catchError(this.handleError));
    }


  



}
