import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../../core/service/student.service';
import { AuthService } from '../../../core/service/auth.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { Student } from '../../../core/models/Student';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentServiceSpy: any;
  let authServiceSpy: any;

  const mockStudents: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
  ];

  beforeEach(async () => {
    studentServiceSpy = {
      getAll: jest.fn().mockReturnValue(of(mockStudents)),
      delete: jest.fn().mockReturnValue(of(void 0))
    };
    authServiceSpy = {
      logout: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    expect(studentServiceSpy.getAll).toHaveBeenCalled();
    expect(component.students.length).toBe(2);
    expect(component.students).toEqual(mockStudents);
  });

  it('should display students in the table', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);

    const firstRowCells = rows[0].queryAll(By.css('td'));
    expect(firstRowCells[1].nativeElement.textContent).toContain('John');
    expect(firstRowCells[2].nativeElement.textContent).toContain('Doe');
  });

  it('should delete a student when confirmed', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteStudent(1);

    expect(studentServiceSpy.delete).toHaveBeenCalledWith(1);
    expect(studentServiceSpy.getAll).toHaveBeenCalledTimes(2); // init + reload
  });

  it('should not delete when confirm is cancelled', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteStudent(1);

    expect(studentServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('should set errorMessage on loadStudents error', () => {
    const error = new HttpErrorResponse({ error: { message: 'Server error' }, status: 500 });
    studentServiceSpy.getAll.mockReturnValue(throwError(() => error));

    component.loadStudents();

    expect(component.errorMessage).toBe('Server error');
    expect(component.loading).toBe(false);
  });

  it('should logout and navigate to login', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
