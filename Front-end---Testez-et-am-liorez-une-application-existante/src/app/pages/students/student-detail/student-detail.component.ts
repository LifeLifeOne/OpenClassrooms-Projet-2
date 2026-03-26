import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-student-detail',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './student-detail.component.html',
  standalone: true,
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  student: Student | null = null;
  loading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.student = data;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || error.message || 'Failed to load student';
          this.loading = false;
        }
      });
  }
}
