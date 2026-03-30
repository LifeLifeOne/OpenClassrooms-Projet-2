package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Unit tests for StudentService.
 * Uses Mockito to mock the repository dependency.
 */
@ExtendWith(SpringExtension.class)
public class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    /**
     * Test fetching all students.
     */
    @Test
    public void test_getAll_returns_list_of_students() {
        // GIVEN
        Student student1 = new Student();
        student1.setFirstName("Alice");
        student1.setLastName("Smith");
        student1.setEmail("alice@example.com");

        Student student2 = new Student();
        student2.setFirstName("Bob");
        student2.setLastName("Jones");
        student2.setEmail("bob@example.com");

        when(studentRepository.findAll()).thenReturn(Arrays.asList(student1, student2));

        // WHEN
        List<Student> students = studentService.getAll();

        // THEN
        assertThat(students).hasSize(2);
        assertThat(students).containsExactly(student1, student2);
        verify(studentRepository, times(1)).findAll();
    }

    /**
     * Test creating a new student.
     */
    @Test
    public void test_create_saves_student() {
        // GIVEN
        Student student = new Student();
        student.setFirstName("Charlie");
        student.setLastName("Brown");
        student.setEmail("charlie@example.com");

        when(studentRepository.save(student)).thenReturn(student);

        // WHEN
        Student savedStudent = studentService.create(student);

        // THEN
        assertThat(savedStudent).isNotNull();
        assertThat(savedStudent.getFirstName()).isEqualTo("Charlie");
        verify(studentRepository, times(1)).save(student);
    }

    /**
     * Test retrieving a student by ID.
     */
    @Test
    public void test_getById_returns_student() {
        // GIVEN
        Long id = 1L;
        Student student = new Student();
        student.setId(id);
        student.setFirstName("Alice");
        when(studentRepository.findById(id)).thenReturn(Optional.of(student));

        // WHEN
        Student found = studentService.getById(id);

        // THEN
        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(id);
        verify(studentRepository).findById(id);
    }

    /**
     * Test updating student information.
     */
    @Test
    public void test_update_modifies_student() {
        // GIVEN
        Long id = 1L;
        Student existing = new Student();
        existing.setId(id);
        existing.setFirstName("Alice");
        existing.setLastName("Smith");
        existing.setEmail("alice@example.com");

        Student updatedInfo = new Student();
        updatedInfo.setFirstName("Alice Updated");
        updatedInfo.setLastName("Smith Updated");
        updatedInfo.setEmail("alice.new@example.com");

        when(studentRepository.findById(id)).thenReturn(Optional.of(existing));
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArguments()[0]);

        // WHEN
        Student result = studentService.update(id, updatedInfo);

        // THEN
        assertThat(result.getFirstName()).isEqualTo("Alice Updated");
        assertThat(result.getEmail()).isEqualTo("alice.new@example.com");
        verify(studentRepository).save(existing);
    }

    /**
     * Test deleting a student by ID.
     */
    @Test
    public void test_delete_removes_student() {
        // GIVEN
        Long id = 1L;
        Student student = new Student();
        student.setId(id);
        when(studentRepository.findById(id)).thenReturn(Optional.of(student));

        // WHEN
        studentService.delete(id);

        // THEN
        verify(studentRepository).delete(student);
    }

    /**
     * Test deleting all students.
     */
    @Test
    public void test_deleteAll_clears_repository() {
        // WHEN
        studentService.deleteAll();

        // THEN
        verify(studentRepository).deleteAll();
    }
}
