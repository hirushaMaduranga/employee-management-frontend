import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeModal } from './employee-modal';

describe('EmployeeModal', () => {
  let component: EmployeeModal;
  let fixture: ComponentFixture<EmployeeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
