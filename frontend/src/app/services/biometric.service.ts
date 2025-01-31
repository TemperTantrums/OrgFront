import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  private apiUrl = 'http://localhost:3000/api/biometric'; // Updated URL

  constructor(private http: HttpClient) {}

  uploadBiometricData(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, data);
  }

  getBiometricRecords(): Observable<any> {
    return this.http.get(`${this.apiUrl}/records`);
  }
}
