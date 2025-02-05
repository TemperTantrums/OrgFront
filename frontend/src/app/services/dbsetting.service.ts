import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DbsettingService {
  private apiUrl = 'http://localhost:3000/api/db-connect'; // Backend API endpoint

  constructor(private http: HttpClient) {}

  // Method to send the connection string to the backend
  sendConnectionString(connectionString: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, { connectionString }, { headers });
  }

  getConnectionStatus(): Observable<any> {
    return this.http.get('http://localhost:3000/api/db-status');
  }
}
