// Code for API service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Import environment config

// Company interface
export interface Company {
  _id?: string;
  company: string;
  department: string;
}

// Injectable metadata
@Injectable({
  providedIn: 'root',
})

// Component class
export class ApiService {
  private apiUrl = `${environment.apiUrl}/api/companies`; // Use environment variable for API URL

  // Dependency injection
  constructor(private http: HttpClient) {}

  // Fetch all companies
  getCompanies(): Observable<Company[]> {
    return this.http.get<{ data: Company[] }>(this.apiUrl).pipe(
      map((response) => response.data),
      catchError((error) => {
        console.error('Error fetching companies:', error);
        return throwError(() => new Error('Failed to fetch companies'));
      })
    );
  }

  // Add a new company
  addCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company);
  }

  // Update an existing company
  updateCompany(id: string, updatedCompany: Company): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, updatedCompany);
  }

  // Delete a company
  deleteCompany(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
