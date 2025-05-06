import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiKey = 'YOUR_API_KEY'; // Get this from countrystatecity.in
  private baseUrl = 'https://api.countrystatecity.in/v1';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return new HttpHeaders().set('X-CSCAPI-KEY', this.apiKey);
  }

  getStates(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/countries/IN/states`,
      { headers: this.getHeaders() }
    );
  }

  getCitiesByState(stateCode: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/countries/IN/states/${stateCode}/cities`,
      { headers: this.getHeaders() }
    );
  }

  getAllCities(): Observable<any> {
    // First get all states
    return this.getStates().pipe(
      map(states => {
        // For each state, get its cities
        const cityPromises = states.map((state: any) =>
          this.getCitiesByState(state.iso2).toPromise()
        );
        return Promise.all(cityPromises);
      })
    );
  }
}