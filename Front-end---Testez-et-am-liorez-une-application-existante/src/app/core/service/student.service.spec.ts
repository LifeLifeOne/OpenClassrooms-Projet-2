import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student } from '../models/Student';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes HTTP non traitées
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all students via GET', () => {
    const mockStudents: Student[] = [
      { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
      { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' }
    ];

    service.getAll().subscribe(students => {
      expect(students.length).toBe(2);
      expect(students).toEqual(mockStudents);
    });

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents); // Simule la réponse du serveur
  });

  it('should create a student via POST', () => {
    const newStudent: Student = { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' };

    service.create(newStudent).subscribe(student => {
      expect(student.firstName).toBe('Charlie');
    });

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newStudent);
    req.flush({ ...newStudent, id: 3 });
  });

  it('should fetch a student by id via GET', () => {
    const mockStudent: Student = { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' };

    service.getById(1).subscribe(student => {
      expect(student).toEqual(mockStudent);
    });

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudent);
  });

  it('should update a student via PUT', () => {
    const updated: Student = { id: 1, firstName: 'Alice', lastName: 'Updated', email: 'alice@example.com' };

    service.update(1, updated).subscribe(student => {
      expect(student.lastName).toBe('Updated');
    });

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('should delete a student via DELETE', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
