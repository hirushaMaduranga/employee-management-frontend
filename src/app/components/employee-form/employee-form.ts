import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { EmployeeRequest } from '../../services/employee';

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

  selectedFile: File | null = null;

  form: EmployeeRequest = {
    employeeCode: '',
    firstName: '',
    lastName: '',
    address: '',
    nic: '',
    mobileNo: '',
    gender: '',
    email: '',
    designationId: 1,
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
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.employeeId = Number(id);

      this.isEditMode = true;

      void this.loadEmployee();
    }
  }

  async loadEmployee(): Promise<void> {
    if (!this.employeeId) {
      return;
    }

    this.loading = true;

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
      console.error(error);

      this.errorMessage = 'Unable to load employee.';
    } finally {
      this.loading = false;

      this.cdr.detectChanges();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async saveEmployee(): Promise<void> {
    this.saving = true;
    this.errorMessage = '';

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
        const body = await response.text();

        throw new Error(body);
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
          throw new Error('Profile image upload failed.');
        }
      }

      await this.router.navigate(['/employees']);
    } catch (error) {
      console.error(error);

      this.errorMessage = 'Unable to save employee.';
    } finally {
      this.saving = false;

      this.cdr.detectChanges();
    }
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
