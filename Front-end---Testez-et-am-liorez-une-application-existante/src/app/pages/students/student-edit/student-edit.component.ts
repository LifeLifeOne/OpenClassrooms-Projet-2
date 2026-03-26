import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-student-edit',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './student-edit.component.html',
  standalone: true,
  styleUrl: './student-edit.component.css'
})
export class StudentEditComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  studentForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  loadingData: boolean = false;
  errorMessage: string = '';
  studentId: number = 0;

  ngOnInit() {
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.loadStudent();
  }

  get form() {
    return this.studentForm.controls;
  }

  loadStudent(): void {
    this.loadingData = true;
    this.studentService.getById(this.studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.studentForm.patchValue({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email
          });
          this.loadingData = false;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || error.message || 'Failed to load student';
          this.loadingData = false;
        }
      });
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
    this.studentService.update(this.studentId, student)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/students']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || error.message || 'Failed to update student';
          this.loading = false;
        }
      });
  }
}
