import { Component, ViewChild, ElementRef } from '@angular/core';
import { DbsettingService } from '../services/dbsetting.service';
import { environment } from '../../environments/environment.prod';
declare var bootstrap: any;

@Component({
  selector: 'app-dbsetting',
  templateUrl: './dbsetting.component.html',
  styleUrls: ['./dbsetting.component.css'],
})
export class DbSettingComponent {
  // Pre-fill with the default connection string from environment
  dbConnectionString: string = environment.defaultMongoUri;

  // ViewChild to reference the modal DOM element
  @ViewChild('dbSettingsModal') dbSettingsModal!: ElementRef;

  constructor(private dbSettingService: DbsettingService) {}

  saveConnectionString() {
    if (!this.dbConnectionString.trim()) {
      alert('Connection string cannot be empty!');
      return;
    }

    // Validate MongoDB connection string format
    const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/;
    if (!mongoUriPattern.test(this.dbConnectionString)) {
      alert('Invalid MongoDB connection string format.');
      return;
    }

    // Send the connection string to the backend
    this.dbSettingService
      .sendConnectionString(this.dbConnectionString)
      .subscribe(
        (response) => {
          console.log('Database connection successful:', response);
          alert('Connected to database successfully!');

          // Close the modal after success
          this.closeModal();
        },
        (error) => {
          console.error('Error connecting to database:', error);
          alert('Failed to connect to the database.');
        }
      );
  }

  // Method to close the modal using Bootstrap's JavaScript API
  closeModal() {
    const modalElement = this.dbSettingsModal.nativeElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement); // Get the modal instance

    if (modalInstance) {
      modalInstance.hide(); // Close the modal
    }
  }

  checkStatus() {
    this.dbSettingService.getConnectionStatus().subscribe((response) => {
      console.log('Database Status:', response.status);
    });
  }

  isValidConnectionString(): boolean {
    const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/;
    return mongoUriPattern.test(this.dbConnectionString);
  }
}
