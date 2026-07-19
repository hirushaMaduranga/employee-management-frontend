import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';

import { Employee } from '../../services/employee';

@Component({
  selector: 'app-employee-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-view.html',
  styleUrl: './employee-view.css',
})
export class EmployeeView implements OnInit {
  employee: Employee | null = null;

  loading = true;
  errorMessage = '';

  private employeeId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Invalid employee ID.';

      this.loading = false;

      return;
    }

    this.employeeId = Number(id);

    void this.loadEmployee();
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

      this.employee = await response.json();
    } catch (error) {
      console.error('Employee view loading error:', error);

      this.errorMessage = 'Unable to load employee details.';
    } finally {
      this.loading = false;

      this.cdr.detectChanges();
    }
  }

  getProfileImageUrl(path: string | null): string {
    if (!path) {
      return '';
    }

    const normalizedPath = path.replace(/\\/g, '/');

    return `http://localhost:8080/${normalizedPath}`;
  }

  downloadPdf(): void {
    if (!this.employeeId) {
      return;
    }

    window.open(`http://localhost:8080/api/reports/employees/${this.employeeId}/pdf`, '_blank');
  }

  downloadExcel(): void {
    if (!this.employeeId) {
      return;
    }

    window.open(`http://localhost:8080/api/reports/employees/${this.employeeId}/excel`, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  editEmployee(): void {
    if (!this.employeeId) {
      return;
    }

    this.router.navigate(['/employees/edit', this.employeeId]);
  }
}
