import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-student-create',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './student-create.component.html',
  standalone: true,
  styleUrl: './student-create.component.css'
})
export class StudentCreateComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get form() {
    return this.studentForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.studentForm.invalid) {
      return;
    }
    this.loading = true;
    const student: Student = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value
    };
    this.studentService.create(student)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/students']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || error.message || 'Failed to create student';
          this.loading = false;
        }
      });
  }
}
