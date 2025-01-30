import { Component } from '@angular/core';
import * as XLSX from 'xlsx'; // Import XLSX for Excel/CSV parsing
declare var bootstrap: any;

@Component({
  selector: 'app-biometric',
  templateUrl: './biometric.component.html',
  styleUrls: ['./biometric.component.css'],
})
export class BiometricComponent {
  uploadedData: any[] = []; // Store extracted data
  selectedFile: File | null = null; // Store the selected file
  modalInstance: any; // To store modal instance for proper handling

  // Open Modal Function
  openModal() {
    var modal = new bootstrap.Modal(document.getElementById('uploadModal'));
    modal.show();
    this.modalInstance.show();
  }

  closeUploadModal() {
    var modal = new bootstrap.Modal(document.getElementById('uploadModal'));
    modal.hide();
  }

  // Store the selected file when chosen
  handleFileSelection(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Handle File Upload when "Upload" is clicked
  handleFileUpload() {
    if (!this.selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Assuming first sheet contains the data
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const extractedData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      // Convert to structured data (assuming fixed format)
      this.uploadedData = extractedData.slice(1).map((row) => ({
        employeeNo: row[0],
        name: row[1],
        timeIn: row[2],
        mealOut: row[3],
        mealIn: row[4],
        timeOut: row[5],
        timestamp: this.convertExcelDateToJSDate(row[6]),
      }));

      // Close the modal after uploading
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  // Convert Excel serial date to JS Date
  convertExcelDateToJSDate(excelDate: number): string {
    const epoch = new Date(1900, 0, 1); // Excel's epoch starts on January 1, 1900
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000); // Convert to milliseconds
    return jsDate.toLocaleString(); // Return formatted date string
  }
}
