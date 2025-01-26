// Code for the OrganizationComponent
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Component metadata
@Component({
  selector: 'app-organization', // Component selector
  templateUrl: './organization.component.html', // HTML template
  styleUrls: ['./organization.component.css'], // CSS styles
})

// Component class
export class OrganizationComponent implements AfterViewInit {
  // Columns to be displayed in the table
  displayedColumns: string[] = ['company', 'department', 'action'];

  // Data source for the material table
  dataSource = new MatTableDataSource<any>([]);

  // Object to store form data for adding/editing entries
  formEntry = { company: '', departments: [''] };

  // Selected entry for editing or deleting
  selectedEntry: any;

  // Flags for controlling modal visibility
  showModal = false; // Add/Edit modal
  showDeleteModal = false; // Delete confirmation modal

  // Flag to indicate whether the operation is an edit
  isEdit = false;

  // Subject for filter input to handle debouncing
  private filterSubject = new Subject<string>();

  // References to Angular Material paginator and sort
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Dependency injection of required services
  constructor(
    private snackBar: MatSnackBar, // To show notifications
    private http: HttpClient, // HTTP client for API requests
    private apiService: ApiService // Custom service for API operations
  ) {}

  // Lifecycle hook called after component initialization
  ngOnInit(): void {
    // Set up the filter subject with debounce and distinctUntilChanged
    this.filterSubject
      .pipe(
        debounceTime(300), // Wait for 300ms after typing stops
        distinctUntilChanged() // Ignore if the filter value hasn't changed
      )
      .subscribe((filterValue) => {
        // Apply the filter to the data source
        this.dataSource.filter = filterValue.trim().toLowerCase();
      });
  }

  // Lifecycle hook called after the view is initialized
  ngAfterViewInit(): void {
    // Fetch data from the API and initialize the data source
    this.apiService.getCompanies().subscribe(
      (data) => {
        this.dataSource.data = data; // Populate the data source
        this.dataSource.paginator = this.paginator; // Attach paginator
        this.dataSource.sort = this.sort; // Attach sorting
      },
      (error) => this.handleError(error, 'Failed to fetch data from the server')
    );

    // Custom filter logic for the table
    this.dataSource.filterPredicate = this.filterPredicate;
  }

  // Custom error handler for API calls
  handleError(error: any, message: string): void {
    console.error(message, error); // Log the error
    this.showNotification(message, true); // Show error notification
  }

  // Filter predicate logic for searching
  filterPredicate(data: any, filter: string): boolean {
    const transformedFilter = filter.trim().toLowerCase();
    // Match filter with company or department
    return (
      data.company.toLowerCase().includes(transformedFilter) ||
      data.department.toLowerCase().includes(transformedFilter)
    );
  }

  // Apply filter to the table data
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterSubject.next(filterValue); // Emit the filter value
  }

  // Save a new entry to the data
  saveNewEntry(): void {
    const existingEntry = this.findExistingEntry(this.formEntry.company);

    if (existingEntry) {
      // Add new departments to an existing company
      this.addDepartmentsToExistingEntry(existingEntry);
    } else {
      // Create a new company entry
      this.createNewEntry();
    }
  }

  // Check for an existing company in the data
  findExistingEntry(companyName: string): any {
    return this.dataSource.data.find(
      (entry) => entry.company.toLowerCase() === companyName.toLowerCase()
    );
  }

  // Add new departments to an existing company entry
  addDepartmentsToExistingEntry(existingEntry: any): void {
    const currentDepartments = existingEntry.department
      .split(',')
      .map((d: string) => d.trim()); // Keep original case for current departments

    const currentDepartmentsLower = currentDepartments.map((d: string) =>
      d.toLowerCase()
    ); // Lowercase for comparison
    const newDepartments = this.formEntry.departments.filter(
      (dept) => !currentDepartmentsLower.includes(dept.trim().toLowerCase()) // Compare in lowercase
    );

    if (newDepartments.length > 0) {
      const updatedDepartments = [...currentDepartments, ...newDepartments];
      existingEntry.department = updatedDepartments.join(', '); // Preserve original case
      this.updateExistingEntry(existingEntry);
    } else {
      this.showNotification(
        'All entered departments already exist for the company',
        true
      );
    }
  }

  // Update an existing company entry
  updateExistingEntry(updatedEntry: any): void {
    this.apiService.updateCompany(updatedEntry._id, updatedEntry).subscribe(
      () => {
        this.refreshTable(); // Refresh the table
        this.closeModal(); // Close the modal
        this.showNotification('Departments added to the existing company');
      },
      (error) => {
        this.showNotification(`Failed to update entry: ${error.message}`, true);
      }
    );
  }

  // Create a new company entry
  createNewEntry(): void {
    const newEntry = {
      company: this.formEntry.company,
      department: this.formEntry.departments.join(', '),
    };

    this.apiService.addCompany(newEntry).subscribe(
      () => {
        this.refreshTable(); // Refresh the table
        this.closeModal(); // Close the modal
        this.showNotification('Entry added successfully');
      },
      (error) => {
        this.showNotification(`Failed to add entry: ${error.message}`, true);
      }
    );
  }

  // Refresh the table by fetching data again
  refreshTable(): void {
    this.apiService.getCompanies().subscribe(
      (data) => this.updateDataSource(data),
      (error) => this.handleError(error, 'Error refreshing data')
    );
  }

  // Save changes to an edited entry
  saveEditedEntry(): void {
    this.selectedEntry.company = this.formEntry.company;
    this.selectedEntry.department = this.formEntry.departments.join(', ');

    this.apiService
      .updateCompany(this.selectedEntry._id, this.selectedEntry)
      .subscribe(
        () => {
          const index = this.dataSource.data.findIndex(
            (entry) => entry._id === this.selectedEntry._id
          );
          if (index !== -1) {
            this.dataSource.data[index] = { ...this.selectedEntry };
            this.dataSource.data = [...this.dataSource.data]; // Trigger table update
          }
          this.closeModal();
          this.showNotification('Entry updated successfully');
        },
        (error) => {
          this.showNotification(`Failed to edit entry: ${error.message}`, true);
        }
      );
  }

  // Confirm and delete an entry
  confirmDelete(): void {
    this.apiService.deleteCompany(this.selectedEntry._id).subscribe(
      () => {
        const updatedData = this.dataSource.data.filter(
          (entry) => entry !== this.selectedEntry
        );
        this.updateDataSource(updatedData);
        this.snackBar.open(
          `${this.selectedEntry.company} - ${this.selectedEntry.department} deleted successfully`,
          'Close',
          { duration: 3000 }
        );
        this.closeDeleteModal();
      },
      (error) => {
        this.showNotification(`Failed to delete entry: ${error.message}`);
      }
    );
  }

  // Update the data source with new data
  updateDataSource(data: any[]): void {
    this.dataSource.data = [...data];
  }

  // Other modal and UI-related methods
  openModal(isEdit: boolean, entry?: any): void {
    this.isEdit = isEdit;
    this.selectedEntry = entry || null; // Set selected entry for editing

    if (isEdit && entry) {
      // For editing, pre-fill the form fields, including departments
      this.formEntry = {
        company: entry.company,
        departments: entry.department.split(',').map((d: string) => d.trim()), // Split and trim departments
      };
    } else {
      // For adding, reset the form fields
      this.formEntry = { company: '', departments: [''] };
    }

    this.showModal = true; // Show the modal
  }

  // Open modals for adding, editing, and deleting entries
  openAddModal(): void {
    this.openModal(false); // For adding a new entry
  }

  openEditModal(entry: any): void {
    this.openModal(true, entry); // For editing an existing entry
  }

  closeModal(): void {
    this.showModal = false;
    this.formEntry = { company: '', departments: [''] }; // Reset fields
  }

  openDeleteModal(element: any): void {
    this.selectedEntry = element;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedEntry = null;
  }

  // Track by index for dynamic lists
  trackByIndex(index: number, item: any): number {
    return item.id || index; // Track by index for dynamic lists
  }

  // Add a new department field
  addDepartment(): void {
    if (this.formEntry.departments.some((dept) => dept.trim() === '')) {
      this.showNotification(
        'Please fill in all department fields before adding a new one',
        true
      );
      return;
    }
    this.formEntry.departments.push(''); // Add a new empty department field
  }

  // Remove a department field
  removeDepartment(index: number): void {
    if (this.formEntry.departments.length > 1) {
      this.formEntry.departments.splice(index, 1); // Remove the selected department
    } else {
      this.showNotification('At least one department is required', true);
    }
  }

  // Prevent typing numbers in department fields
  restrictNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode >= 48 && charCode <= 57) {
      event.preventDefault();
    }
  }

  // Check if the filtered data is empty
  isFilteredDataEmpty(): boolean {
    return this.dataSource.filteredData.length === 0;
  }

  clearFilter(filterInput: HTMLInputElement): void {
    // Clear the input field
    filterInput.value = '';

    // Reset the filter
    this.dataSource.filter = '';

    // Reset the sorting
    if (this.sort) {
      this.sort.active = ''; // Reset active column
      this.sort.direction = ''; // Reset sorting direction
      this.sort.sortChange.emit(); // Trigger the sorting reset
    }
  }

  // Show a notification message
  showNotification(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : undefined,
    });
  }
}
