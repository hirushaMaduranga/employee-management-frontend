import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Employees } from './components/employees/employees';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeView } from './components/employee-view/employee-view';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: Login,
  },

  {
    path: 'dashboard',
    component: Dashboard,
  },

  {
    path: 'employees',
    component: Employees,
  },

  {
    path: 'employees/add',
    component: EmployeeForm,
  },

  {
    path: 'employees/view/:id',
    component: EmployeeView,
  },

  {
    path: 'employees/edit/:id',
    component: EmployeeForm,
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
