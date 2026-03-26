import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { AuthService } from '../../../core/service/auth.service';
import { Student } from '../../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './student-list.component.html',
  standalone: true,
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  students: Student[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = '';
    this.studentService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.students = data;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || error.message || 'Failed to load students';
          this.loading = false;
        }
      });
  }

  deleteStudent(id: number): void {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }
    this.studentService.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadStudents(),
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || error.message || 'Failed to delete student';
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
