import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DtrComponent } from './dtr.component';

describe('DtrComponent', () => {
  let component: DtrComponent;
  let fixture: ComponentFixture<DtrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DtrComponent]
    });
    fixture = TestBed.createComponent(DtrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
