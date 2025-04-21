import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  constructor(private http: HttpClient) {}

  searchAddress(query: string): Observable<string[]> {
    return this.http.get<any[]>(`https://api.postalpincode.in/postoffice/${query}`)
      .pipe(
        map(response => {
          if (response[0]?.Status === 'Success') {
            return response[0].PostOffice.map((po: any) => 
              `${po.Name}, ${po.District}, ${po.State}, ${po.Pincode}`
            );
          }
          return [];
        })
      );
  }
}