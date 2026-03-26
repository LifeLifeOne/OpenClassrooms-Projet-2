import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { StudentListComponent } from './pages/students/student-list/student-list.component';
import { StudentDetailComponent } from './pages/students/student-detail/student-detail.component';
import { StudentCreateComponent } from './pages/students/student-create/student-create.component';
import { StudentEditComponent } from './pages/students/student-edit/student-edit.component';
import { authGuard } from './core/guard/auth.guard';
import { loginGuard } from './core/guard/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'students',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'students',
    canActivate: [authGuard],
    children: [
      { path: '', component: StudentListComponent },
      { path: 'create', component: StudentCreateComponent },
      { path: ':id', component: StudentDetailComponent },
      { path: ':id/edit', component: StudentEditComponent }
    ]
  }
];
