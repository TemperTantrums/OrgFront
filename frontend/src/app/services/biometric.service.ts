import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Import environment config

@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  private apiUrl = `${environment.apiUrl}/api/biometric`; // Use environment variable for API URL

  constructor(private http: HttpClient) {}

  // Upload biometric data
  uploadBiometricData(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, data);
  }

  // Get biometric records
  getBiometricRecords(): Observable<any> {
    return this.http.get(`${this.apiUrl}/records`);
  }
}
