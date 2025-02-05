import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Import environment config

@Injectable({
  providedIn: 'root',
})
export class DbsettingService {
  private apiUrl = `${environment.apiUrl}/api/db-connect`; // Use environment variable for API URL
  private statusUrl = `${environment.apiUrl}/api/db-status`; // Endpoint for checking DB status

  constructor(private http: HttpClient) {}

  // Send the connection string to the backend
  sendConnectionString(connectionString: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, { connectionString }, { headers });
  }

  // Get the database connection status
  getConnectionStatus(): Observable<any> {
    return this.http.get(this.statusUrl);
  }
}
