import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Employee } from '../../services/employee';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  employees: Employee[] = [];

  keyword = '';
  status = 'ALL';

  loading = true;
  errorMessage = '';

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

      if (this.keyword.trim()) {
        params.set('keyword', this.keyword.trim());
      }

      params.set('status', this.status);

      const response = await fetch(`${this.apiUrl}/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.employees = await response.json();
    } catch (error) {
      console.error(error);

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
    this.keyword = '';
    this.status = 'ALL';

    void this.loadEmployees();
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
      console.error(error);

      alert('Unable to update employee status.');
    }
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
