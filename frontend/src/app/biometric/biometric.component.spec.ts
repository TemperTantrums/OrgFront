import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiometricComponent } from './biometric.component';

describe('BiometricComponent', () => {
  let component: BiometricComponent;
  let fixture: ComponentFixture<BiometricComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BiometricComponent]
    });
    fixture = TestBed.createComponent(BiometricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
