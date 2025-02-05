import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BiometricService } from '../services/biometric.service';
declare var bootstrap: any;

@Component({
  selector: 'app-biometric',
  templateUrl: './biometric.component.html',
  styleUrls: ['./biometric.component.css'],
})
export class BiometricComponent implements AfterViewInit {
  displayedColumns: string[] = ['enNo', 'DateTime'];
  dataSource = new MatTableDataSource<any>([]);
  selectedFile: File | null = null;
  modalInstance: any;
  isUploading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private biometricService: BiometricService,
    private snackBar: MatSnackBar
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openModal() {
    const modalElement = document.getElementById('uploadModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  handleFileSelection(event: any) {
    this.selectedFile = event.target.files[0];

    if (!this.selectedFile) {
      this.showNotification('Please select a file first!', 'error');
      return;
    }

    // ✅ Validate file type: Only allow .txt files
    const fileName = this.selectedFile.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (fileExtension !== 'txt') {
      this.showNotification(
        'Invalid file type! Please upload a .TXT file.',
        'error'
      );
      this.selectedFile = null; // Reset selection
      event.target.value = ''; // Clear file input field
      return;
    }

    this.handleFileUpload();
  }

  handleFileUpload() {
    if (!this.selectedFile) {
      this.showNotification('Please select a file first!', 'error');
      return;
    }

    this.isUploading = true;
    const reader = new FileReader();
    let chunkSize = 500;
    let linesBuffer: string[] = [];
    let lineReader = new FileReader();

    reader.onload = (e: any) => {
      const fileContent = e.target.result;
      const lines = fileContent.split('\n');

      if (lines.length < 2) {
        this.showNotification('No valid data found in the file.', 'error');
        this.isUploading = false;
        return;
      }

      let headers = lines[0].trim().split(/\s+/);
      let enNoIndex = headers.indexOf('EnNo');
      let dateIndex = headers.indexOf('DateTime');

      if (enNoIndex === -1 || dateIndex === -1) {
        this.showNotification(
          'Invalid file format: Missing required columns (EnNo, DateTime).',
          'error'
        );
        this.isUploading = false;
        return;
      }

      let totalChunks = Math.ceil(lines.length / chunkSize);
      let currentChunk = 0;

      const processChunk = () => {
        if (currentChunk >= totalChunks) {
          console.log('All chunks processed.');
          this.isUploading = false;
          this.closeModal();
          return;
        }

        let chunkLines = lines.slice(
          currentChunk * chunkSize,
          (currentChunk + 1) * chunkSize
        );
        let extractedData = this.extractDataFromChunk(chunkLines);

        if (extractedData.length > 0) {
          this.uploadDataToMongoDB(extractedData, () => {
            currentChunk++;
            processChunk();
          });
        } else {
          currentChunk++;
          processChunk();
        }
      };

      processChunk();
    };

    reader.readAsText(this.selectedFile);
  }

  extractDataFromChunk(chunkLines: string[]) {
    let regex =
      /(\d+)\s+(\d+)\s+(\d+)\s+.*\s+\d+\s+(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2})/;

    return chunkLines
      .map((line: string) => {
        let match = line.trim().match(regex);
        if (!match) return null;
        return {
          enNo: match[3],
          DateTime: match[4],
        };
      })
      .filter(Boolean);
  }

  uploadDataToMongoDB(data: any[], callback: () => void) {
    this.biometricService.uploadBiometricData(data).subscribe({
      next: (response) => {
        console.log(`Uploaded ${data.length} records.`);
        this.dataSource.data = [...this.dataSource.data, ...data];
        this.showNotification(
          `Uploaded ${data.length} records successfully!`,
          'success'
        );
        callback();
      },
      error: (error) => {
        console.error('Error uploading data:', error);
        this.showNotification('Failed to upload data.', 'error');
        callback();
      },
    });
  }

  fetchRecords() {
    this.biometricService.getBiometricRecords().subscribe(
      (data) => {
        this.dataSource.data = [...data];
        console.log('Fetched data:', this.dataSource.data);
        this.showNotification('Records fetched successfully!', 'success');
      },
      (error) => {
        console.error('Error fetching records:', error);
        this.showNotification('Failed to fetch records.', 'error');
      }
    );
  }

  clearRecords() {
    this.dataSource.data = [];
    this.showNotification('Records cleared.', 'success');
  }
}
