import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/models/Login';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  token: string = '';
  errorMessage: string = '';

  ngOnInit() {
    this.loginForm = this.formBuilder.group(
      {
        login: ['', Validators.required],
        password: ['', Validators.required]
      },
    );
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.token = '';
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    const loginUser: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };
    this.userService.login(loginUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: string) => {
          this.token = response;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || error.message || 'Login failed';
          this.loading = false;
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.token = '';
    this.errorMessage = '';
    this.loginForm.reset();
  }
}
