import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Employee } from '../../services/employee';
import { EmployeeModal } from '../employee-modal/employee-modal';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmployeeModal],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  employees: Employee[] = [];

  employeeCode = '';
  nic = '';
  employeeName = '';
  status = 'ALL';

  loading = true;
  errorMessage = '';

  showEmployeeModal = false;

  private readonly apiUrl = 'http://localhost:8080/api/employees';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.loadEmployees();
  }

  async loadEmployees(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const params = new URLSearchParams();

      if (this.employeeCode.trim()) {
        params.set('employeeCode', this.employeeCode.trim());
      }

      if (this.nic.trim()) {
        params.set('nic', this.nic.trim());
      }

      if (this.employeeName.trim()) {
        params.set('name', this.employeeName.trim());
      }

      params.set('status', this.status);

      const response = await fetch(`${this.apiUrl}/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: Employee[] = await response.json();

      this.employees = data ?? [];
    } catch (error) {
      console.error('Employee loading error:', error);

      this.errorMessage = 'Unable to load employees.';
    } finally {
      this.loading = false;

      this.cdr.detectChanges();
    }
  }

  search(): void {
    void this.loadEmployees();
  }

  reset(): void {
    this.employeeCode = '';
    this.nic = '';
    this.employeeName = '';
    this.status = 'ALL';

    void this.loadEmployees();
  }

  openEmployeeModal(): void {
    this.showEmployeeModal = true;
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false;
  }

  async onEmployeeCreated(): Promise<void> {
    this.showEmployeeModal = false;

    await this.loadEmployees();
  }

  async changeStatus(employee: Employee): Promise<void> {
    const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const response = await fetch(
        `${this.apiUrl}/${employee.employeeId}/status?status=${newStatus}`,
        {
          method: 'PATCH',
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await this.loadEmployees();
    } catch (error) {
      console.error('Status update error:', error);

      alert('Unable to update employee status.');
    }
  }

  getProfileImageUrl(path: string | null): string {
    if (!path) {
      return '';
    }

    const normalizedPath = path.replace(/\\/g, '/');

    return `http://localhost:8080/${normalizedPath}`;
  }

  downloadCsv(): void {
    window.open('http://localhost:8080/api/reports/employees/csv', '_blank');
  }

  downloadPdf(): void {
    window.open('http://localhost:8080/api/reports/employees/pdf', '_blank');
  }

  logout(): void {
    localStorage.removeItem('username');

    this.router.navigate(['/login']);
  }
}
