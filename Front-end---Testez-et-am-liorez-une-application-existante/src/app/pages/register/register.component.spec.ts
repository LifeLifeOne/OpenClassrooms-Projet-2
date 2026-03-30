import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceSpy: any;
  let router: Router;

  beforeEach(async () => {
    userServiceSpy = {
      register: jest.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        provideRouter([]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields', () => {
    expect(component.registerForm.value).toEqual({
      firstName: '',
      lastName: '',
      login: '',
      password: ''
    });
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(component.submitted).toBe(true);
    expect(userServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should submit and navigate on valid form', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'pass'
    });

    component.onSubmit();

    expect(userServiceSpy.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'pass'
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should reset form on onReset', () => {
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      login: 'jdoe',
      password: 'pass'
    });
    component.submitted = true;

    component.onReset();

    expect(component.submitted).toBe(false);
  });

  it('should expose form controls via getter', () => {
    expect(component.form).toBe(component.registerForm.controls);
  });
});
