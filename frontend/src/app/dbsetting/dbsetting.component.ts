import { Component } from '@angular/core';

@Component({
  selector: 'app-dbsetting',
  templateUrl: './dbsetting.component.html',
  styleUrls: ['./dbsetting.component.css'],
})
export class DbSettingComponent {
  dbConnectionString: string = '';

  constructor() {}

  saveConnectionString() {
    if (!this.dbConnectionString.trim()) {
      alert('Connection string cannot be empty!');
      return;
    }

    console.log('Database Connection String:', this.dbConnectionString);

    // Proceed to send it to the backend or process further
  }
}
