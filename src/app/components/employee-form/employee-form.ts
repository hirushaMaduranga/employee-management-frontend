import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { Designation, EmployeeRequest } from '../../services/employee';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeForm implements OnInit {
  employeeId: number | null = null;

  isEditMode = false;

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  selectedFile: File | null = null;

  designations: Designation[] = [];

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.loadDesignations();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.employeeId = Number(id);

      this.isEditMode = true;

      void this.loadEmployee();
    }
  }

  async loadDesignations(): Promise<void> {
    try {
      const response = await fetch('http://localhost:8080/api/designations');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: Designation[] = await response.json();

      this.designations = data ?? [];

      if (!this.isEditMode && this.designations.length > 0 && !this.form.designationId) {
        this.form.designationId = this.designations[0].designationId;
      }
    } catch (error) {
      console.error('Designation loading error:', error);

      this.errorMessage = 'Unable to load designations.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  async loadEmployee(): Promise<void> {
    if (!this.employeeId) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const response = await fetch(`http://localhost:8080/api/employees/${this.employeeId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const employee = await response.json();

      this.form = {
        employeeCode: employee.employeeCode,

        firstName: employee.firstName,

        lastName: employee.lastName,

        address: employee.address,

        nic: employee.nic,

        mobileNo: employee.mobileNo,

        gender: employee.gender,

        email: employee.email,

        designationId: employee.designation.designationId,

        profileImagePath: employee.profileImagePath,

        dateOfBirth: employee.dateOfBirth,

        status: employee.status,
      };
    } catch (error) {
      console.error('Employee loading error:', error);

      this.errorMessage = 'Unable to load employee details.';
    } finally {
      this.loading = false;

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

    if (!this.form.nic.trim()) {
      this.errorMessage = 'NIC is required.';

      return false;
    }

    if (!this.form.mobileNo.trim()) {
      this.errorMessage = 'Mobile number is required.';

      return false;
    }

    if (!/^[0-9]{10}$/.test(this.form.mobileNo)) {
      this.errorMessage = 'Mobile number must contain 10 digits.';

      return false;
    }

    if (!this.form.email.trim()) {
      this.errorMessage = 'Email is required.';

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

    if (!this.form.address.trim()) {
      this.errorMessage = 'Address is required.';

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
    this.successMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.saving = true;

    try {
      const url =
        this.isEditMode && this.employeeId
          ? `http://localhost:8080/api/employees/${this.employeeId}`
          : 'http://localhost:8080/api/employees';

      const method = this.isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,

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

        throw new Error(backendMessage || 'Unable to save employee.');
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
          throw new Error('Employee saved, but profile image upload failed.');
        }
      }

      await this.router.navigate(['/employees']);
    } catch (error) {
      console.error('Employee save error:', error);

      const message = error instanceof Error ? error.message : 'Unable to save employee.';

      this.errorMessage = message;
    } finally {
      this.saving = false;

      this.cdr.detectChanges();
    }
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
