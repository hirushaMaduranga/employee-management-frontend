import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Designation, EmployeeRequest } from '../../services/employee';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-modal.html',
  styleUrl: './employee-modal.css',
})
export class EmployeeModal implements OnInit {
  @Input() visible = false;

  @Output() closeModal = new EventEmitter<void>();

  @Output() employeeCreated = new EventEmitter<void>();

  designations: Designation[] = [];

  selectedFile: File | null = null;

  saving = false;
  errorMessage = '';

  form: EmployeeRequest = {
    employeeCode: '',
    firstName: '',
    lastName: '',
    address: '',
    nic: '',
    mobileNo: '',
    gender: '',
    email: '',
    designationId: 0,
    profileImagePath: null,
    dateOfBirth: '',
    status: 'ACTIVE',
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    void this.loadDesignations();
  }

  async loadDesignations(): Promise<void> {
    try {
      const response = await fetch('http://localhost:8080/api/designations');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: Designation[] = await response.json();

      this.designations = data ?? [];

      if (this.designations.length > 0 && !this.form.designationId) {
        this.form.designationId = this.designations[0].designationId;
      }
    } catch (error) {
      console.error('Designation loading error:', error);

      this.errorMessage = 'Unable to load designations.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only JPG and PNG images are allowed.';

      input.value = '';

      this.selectedFile = null;

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Profile image must be smaller than 5MB.';

      input.value = '';

      this.selectedFile = null;

      return;
    }

    this.errorMessage = '';

    this.selectedFile = file;
  }

  validateForm(): boolean {
    if (!this.form.employeeCode.trim()) {
      this.errorMessage = 'Employee code is required.';
      return false;
    }

    if (!this.form.firstName.trim()) {
      this.errorMessage = 'First name is required.';
      return false;
    }

    if (!this.form.lastName.trim()) {
      this.errorMessage = 'Last name is required.';
      return false;
    }

    if (!this.form.address.trim()) {
      this.errorMessage = 'Address is required.';
      return false;
    }

    if (!this.form.nic.trim()) {
      this.errorMessage = 'NIC is required.';
      return false;
    }

    if (!/^[0-9]{10}$/.test(this.form.mobileNo)) {
      this.errorMessage = 'Mobile number must contain 10 digits.';
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    if (!this.form.gender) {
      this.errorMessage = 'Please select a gender.';
      return false;
    }

    if (!this.form.dateOfBirth) {
      this.errorMessage = 'Date of birth is required.';
      return false;
    }

    if (!this.form.designationId) {
      this.errorMessage = 'Please select a designation.';
      return false;
    }

    this.errorMessage = '';

    return true;
  }

  async saveEmployee(): Promise<void> {
    this.errorMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.saving = true;

    try {
      const response = await fetch('http://localhost:8080/api/employees', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(this.form),
      });

      if (!response.ok) {
        let backendMessage = '';

        try {
          const body = await response.json();

          backendMessage = body.message || body.error || '';
        } catch {
          backendMessage = await response.text();
        }

        throw new Error(backendMessage || 'Unable to create employee.');
      }

      const employee = await response.json();

      if (this.selectedFile) {
        const formData = new FormData();

        formData.append('file', this.selectedFile);

        const uploadResponse = await fetch(
          `http://localhost:8080/api/employees/${employee.employeeId}/profile-image`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error('Employee created, but profile image upload failed.');
        }
      }

      this.employeeCreated.emit();

      this.close();
    } catch (error) {
      console.error('Employee create error:', error);

      this.errorMessage = error instanceof Error ? error.message : 'Unable to create employee.';
    } finally {
      this.saving = false;

      this.cdr.detectChanges();
    }
  }

  close(): void {
    this.resetForm();

    this.closeModal.emit();
  }

  resetForm(): void {
    this.form = {
      employeeCode: '',
      firstName: '',
      lastName: '',
      address: '',
      nic: '',
      mobileNo: '',
      gender: '',
      email: '',
      designationId: this.designations.length > 0 ? this.designations[0].designationId : 0,
      profileImagePath: null,
      dateOfBirth: '',
      status: 'ACTIVE',
    };

    this.selectedFile = null;
    this.errorMessage = '';
  }
}
