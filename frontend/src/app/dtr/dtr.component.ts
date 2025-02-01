import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

interface DTRRecord {
  date: string;
  amArrival: string;
  amDeparture: string;
  pmArrival: string;
  pmDeparture: string;
  undertimeHour: number;
  undertimeMin: number;
}

@Component({
  selector: 'app-dtr',
  templateUrl: './dtr.component.html',
  styleUrls: ['./dtr.component.css'],
})
export class DtrComponent {
  displayedColumns: string[] = [
    'date',
    'amArrival',
    'amDeparture',
    'pmArrival',
    'pmDeparture',
    'undertimeHour',
    'undertimeMin',
  ];
  dataSource = new MatTableDataSource<DTRRecord>(this.generateDTRRecords());

  // Separate URLs for left and right logos
  leftLogoUrl: string | ArrayBuffer | null = null;
  rightLogoUrl: string | ArrayBuffer | null = null;

  // References to file inputs
  @ViewChild('leftLogoInput') leftLogoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('rightLogoInput') rightLogoInput!: ElementRef<HTMLInputElement>;

  // Trigger file input for left logo
  triggerLeftLogoUpload(): void {
    this.leftLogoInput.nativeElement.click();
  }

  // Trigger file input for right logo
  triggerRightLogoUpload(): void {
    this.rightLogoInput.nativeElement.click();
  }

  // Handle left logo upload
  onLeftLogoUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.leftLogoUrl = e.target?.result ?? null;
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  }

  // Handle right logo upload
  onRightLogoUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.rightLogoUrl = e.target?.result ?? null;
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  }

  // Generate sample DTR records
  generateDTRRecords(): DTRRecord[] {
    const records: DTRRecord[] = [];
    const days = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    for (let i = 1; i <= 15; i++) {
      const day = days[(i + 4) % 7]; // Adjusted to start from Friday
      records.push({
        date: `${i < 10 ? '0' + i : i} ${day}`,
        amArrival: '',
        amDeparture: '',
        pmArrival: '',
        pmDeparture: '',
        undertimeHour: 0,
        undertimeMin: 0,
      });
    }
    return records;
  }

  // Calculate total undertime hours
  getTotalUndertimeHours(): number {
    return this.dataSource.data.reduce(
      (total, record) => total + (record.undertimeHour || 0),
      0
    );
  }

  // Calculate total undertime minutes
  getTotalUndertimeMinutes(): number {
    return this.dataSource.data.reduce(
      (total, record) => total + (record.undertimeMin || 0),
      0
    );
  }
}
