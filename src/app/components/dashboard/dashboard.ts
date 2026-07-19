import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

interface DashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  totalEmployees = 0;
  activeEmployees = 0;
  inactiveEmployees = 0;

  loading = true;
  errorMessage = '';

  username = localStorage.getItem('username') || 'Admin';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const response = await fetch('http://localhost:8080/api/dashboard/summary');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: DashboardSummary = await response.json();

      this.totalEmployees = data.totalEmployees ?? 0;

      this.activeEmployees = data.activeEmployees ?? 0;

      this.inactiveEmployees = data.inactiveEmployees ?? 0;
    } catch (error) {
      console.error('Dashboard loading error:', error);

      this.errorMessage = 'Unable to load dashboard information.';
    } finally {
      this.loading = false;

      this.cdr.detectChanges();
    }
  }

  logout(): void {
    localStorage.removeItem('username');

    this.router.navigate(['/login']);
  }
}
