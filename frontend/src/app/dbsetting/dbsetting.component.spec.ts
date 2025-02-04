import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbsettingComponent } from './dbsetting.component';

describe('DbsettingComponent', () => {
  let component: DbsettingComponent;
  let fixture: ComponentFixture<DbsettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DbsettingComponent]
    });
    fixture = TestBed.createComponent(DbsettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
