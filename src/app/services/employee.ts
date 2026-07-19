import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Designation {
  designationId: number;
  designationName: string;
  active: boolean;
}

export interface Employee {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  address: string;
  nic: string;
  mobileNo: string;
  gender: string;
  email: string;
  designation: Designation;
  profileImagePath: string | null;
  dateOfBirth: string;
  status: string;
}

export interface EmployeeRequest {
  employeeCode: string;
  firstName: string;
  lastName: string;
  address: string;
  nic: string;
  mobileNo: string;
  gender: string;
  email: string;
  designationId: number;
  profileImagePath: string | null;
  dateOfBirth: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(request: EmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, request);
  }

  updateEmployee(id: number, request: EmployeeRequest): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, request);
  }

  uploadProfileImage(id: number, file: File): Observable<Employee> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<Employee>(`${this.apiUrl}/${id}/profile-image`, formData);
  }

  searchEmployees(keyword: string, status: string): Observable<Employee[]> {
    let params = new HttpParams();

    if (keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }

    params = params.set('status', status);

    return this.http.get<Employee[]>(`${this.apiUrl}/search`, {
      params,
    });
  }

  updateStatus(employeeId: number, status: string): Observable<Employee> {
    return this.http.patch<Employee>(`${this.apiUrl}/${employeeId}/status`, null, {
      params: {
        status,
      },
    });
  }
}
