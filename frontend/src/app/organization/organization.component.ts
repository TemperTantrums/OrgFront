import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent implements AfterViewInit {
  displayedColumns: string[] = ['company', 'department', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  formEntry = { company: '', departments: [''] };
  selectedEntry: any;
  showModal = false;
  showDeleteModal = false;
  isEdit = false;
  private filterSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.filterSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((filterValue) => {
        this.dataSource.filter = filterValue.trim().toLowerCase();
      });
  }

  ngAfterViewInit(): void {
    this.apiService.getCompanies().subscribe(
      (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => this.handleError(error, 'Failed to fetch data from the server')
    );

    this.dataSource.filterPredicate = this.filterPredicate;
  }

  handleError(error: any, message: string): void {
    console.error(message, error);
    this.showNotification(message, true);
  }

  filterPredicate(data: any, filter: string): boolean {
    const transformedFilter = filter.trim().toLowerCase();
    return (
      data.company.toLowerCase().includes(transformedFilter) ||
      data.department.toLowerCase().includes(transformedFilter)
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterSubject.next(filterValue);
  }

  saveNewEntry(): void {
    const existingEntry = this.findExistingEntry(this.formEntry.company);

    if (existingEntry) {
      this.addDepartmentsToExistingEntry(existingEntry);
    } else {
      this.createNewEntry();
    }
  }

  findExistingEntry(companyName: string): any {
    return this.dataSource.data.find(
      (entry) => entry.company.toLowerCase() === companyName.toLowerCase()
    );
  }

  addDepartmentsToExistingEntry(existingEntry: any): void {
    const currentDepartments = existingEntry.department
      .split(',')
      .map((d: string) => d.trim());

    const currentDepartmentsLower = currentDepartments.map((d: string) =>
      d.toLowerCase()
    );
    const newDepartments = this.formEntry.departments.filter(
      (dept) => !currentDepartmentsLower.includes(dept.trim().toLowerCase())
    );

    if (newDepartments.length > 0) {
      const updatedDepartments = [...currentDepartments, ...newDepartments];
      existingEntry.department = updatedDepartments.join(', ');
      this.updateExistingEntry(existingEntry);
    } else {
      this.showNotification(
        'All entered departments already exist for the company',
        true
      );
    }
  }

  updateExistingEntry(updatedEntry: any): void {
    this.apiService.updateCompany(updatedEntry._id, updatedEntry).subscribe(
      () => {
        this.refreshTable();
        this.closeModal();
        this.showNotification('Departments added to the existing company');
      },
      (error) => {
        this.showNotification(`Failed to update entry: ${error.message}`, true);
      }
    );
  }

  createNewEntry(): void {
    const newEntry = {
      company: this.formEntry.company,
      department: this.formEntry.departments.join(', '),
    };

    this.apiService.addCompany(newEntry).subscribe(
      () => {
        this.refreshTable();
        this.closeModal();
        this.showNotification('Entry added successfully');
      },
      (error) => {
        this.showNotification(`Failed to add entry: ${error.message}`, true);
      }
    );
  }

  refreshTable(): void {
    this.apiService.getCompanies().subscribe(
      (data) => this.updateDataSource(data),
      (error) => this.handleError(error, 'Error refreshing data')
    );
  }

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
            this.dataSource.data = [...this.dataSource.data];
          }
          this.closeModal();
          this.showNotification('Entry updated successfully');
        },
        (error) => {
          this.showNotification(`Failed to edit entry: ${error.message}`, true);
        }
      );
  }

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

  updateDataSource(data: any[]): void {
    this.dataSource.data = [...data];
  }

  openModal(isEdit: boolean, entry?: any): void {
    this.isEdit = isEdit;
    this.selectedEntry = entry || null;

    if (isEdit && entry) {
      this.formEntry = {
        company: entry.company,
        departments: entry.department.split(',').map((d: string) => d.trim()),
      };
    } else {
      this.formEntry = { company: '', departments: [''] };
    }

    this.showModal = true;
  }

  openAddModal(): void {
    this.openModal(false);
  }

  openEditModal(entry: any): void {
    this.openModal(true, entry);
  }

  closeModal(): void {
    this.showModal = false;
    this.formEntry = { company: '', departments: [''] };
  }

  openDeleteModal(element: any): void {
    this.selectedEntry = element;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedEntry = null;
  }

  trackByIndex(index: number, item: any): number {
    return item.id || index;
  }

  addDepartment(): void {
    if (this.formEntry.departments.some((dept) => dept.trim() === '')) {
      this.showNotification(
        'Please fill in all department fields before adding a new one',
        true
      );
      return;
    }
    this.formEntry.departments.push('');
  }

  removeDepartment(index: number): void {
    if (this.formEntry.departments.length > 1) {
      this.formEntry.departments.splice(index, 1);
    } else {
      this.showNotification('At least one department is required', true);
    }
  }

  restrictNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode >= 48 && charCode <= 57) {
      event.preventDefault();
    }
  }

  isFilteredDataEmpty(): boolean {
    return this.dataSource.filteredData.length === 0;
  }

  clearFilter(filterInput: HTMLInputElement): void {
    filterInput.value = '';
    this.dataSource.filter = '';

    if (this.sort) {
      this.sort.active = '';
      this.sort.direction = '';
      this.sort.sortChange.emit();
    }
  }

  showNotification(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : undefined,
    });
  }
}
