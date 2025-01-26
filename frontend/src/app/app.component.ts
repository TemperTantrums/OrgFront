// Code: Component class for the root component
import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Company interface
export interface Company {
  _id?: string;
  company: string;
  department: string;
}

// Component metadata
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

// Component class
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  companies: Company[] = [];
  newCompany: Company = { company: '', department: '' };
  isLoading = false;

  // Dependency injection
  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  // Lifecycle hook
  ngOnInit(): void {
    this.loadCompanies();
  }

  // Fetch all companies
  loadCompanies(): void {
    this.isLoading = true;
    this.apiService.getCompanies().subscribe(
      (data) => {
        this.companies = data;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.handleError(error, 'Failed to load companies');
      }
    );
  }

  // Add a new company
  addCompany(): void {
    this.apiService.addCompany(this.newCompany).subscribe(
      (company) => {
        this.companies.push(company);
        this.newCompany = { company: '', department: '' };
        this.showNotification('Company added successfully');
      },
      (error) => {
        this.handleError(error, 'Failed to add company');
      }
    );
  }

  // Update an existing company
  updateCompany(id: string, updatedData: Company): void {
    this.apiService.updateCompany(id, updatedData).subscribe(
      (updatedCompany) => {
        const index = this.companies.findIndex((c) => c._id === id);
        if (index !== -1) {
          this.companies[index] = updatedCompany;
        }
        this.showNotification('Company updated successfully');
      },
      (error) => {
        this.handleError(error, 'Failed to update company');
      }
    );
  }

  // Delete a company
  deleteCompany(id: string): void {
    if (confirm('Are you sure you want to delete this company?')) {
      this.apiService.deleteCompany(id).subscribe(
        () => {
          this.companies = this.companies.filter((c) => c._id !== id);
          this.showNotification('Company deleted successfully');
        },
        (error) => {
          this.handleError(error, 'Failed to delete company');
        }
      );
    }
  }

  // Error handler
  private handleError(error: any, context: string): void {
    console.error(`${context}:`, error);
    this.showNotification(`${context}. Please try again.`, true);
  }

  // Notification handler
  private showNotification(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : undefined,
    });
  }
}
