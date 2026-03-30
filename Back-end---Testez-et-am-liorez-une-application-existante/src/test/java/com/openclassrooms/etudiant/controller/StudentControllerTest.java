package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.StudentDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.repository.StudentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.testcontainers.mysql.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

/**
 * Integration tests for StudentController.
 * Uses a real MySQL database in a Docker container via Testcontainers.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class StudentControllerTest {

    private static final String URL = "/api/students";

    @Container
    static MySQLContainer mySQLContainer = new MySQLContainer("mysql:latest");

    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MockMvc mockMvc;

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mySQLContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mySQLContainer::getUsername);
        registry.add("spring.datasource.password", mySQLContainer::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }

    @AfterEach
    public void afterEach() {
        studentRepository.deleteAll();
    }

    /**
     * Test retrieving all students list.
     */
    @Test
    @WithMockUser
    public void getAllStudentsSuccessful() throws Exception {
        // GIVEN
        Student student = new Student();
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setEmail("john.doe@example.com");
        studentRepository.save(student);

        // WHEN & THEN
        mockMvc.perform(MockMvcRequestBuilders.get(URL)
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].firstName").value("John"))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].lastName").value("Doe"));
    }

    /**
     * Test creating a new student via POST request.
     */
    @Test
    @WithMockUser
    public void createStudentSuccessful() throws Exception {
        // GIVEN
        StudentDTO studentDTO = new StudentDTO();
        studentDTO.setFirstName("Jane");
        studentDTO.setLastName("Smith");
        studentDTO.setEmail("jane.smith@example.com");

        // WHEN & THEN
        mockMvc.perform(MockMvcRequestBuilders.post(URL)
                .content(objectMapper.writeValueAsString(studentDTO))
                .contentType(MediaType.APPLICATION_JSON)        
                .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Jane"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.lastName").value("Smith"));
    }

    /**
     * Test retrieving a student by its ID.
     */
    @Test
    @WithMockUser
    public void getStudentByIdSuccessful() throws Exception {
        // GIVEN
        Student student = new Student();
        student.setFirstName("Alice");
        student.setLastName("Wonder");
        student.setEmail("alice@wonderland.com");
        student = studentRepository.save(student);

        // WHEN & THEN
        mockMvc.perform(MockMvcRequestBuilders.get(URL + "/" + student.getId()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("Alice"));
    }

    /**
     * Test updating a student information.
     */
    @Test
    @WithMockUser
    public void updateStudentSuccessful() throws Exception {
        // GIVEN
        Student student = new Student();
        student.setFirstName("Old");
        student.setLastName("Name");
        student.setEmail("old@example.com");
        student = studentRepository.save(student);

        StudentDTO updatedDTO = new StudentDTO();
        updatedDTO.setFirstName("New");
        updatedDTO.setLastName("Name");
        updatedDTO.setEmail("new@example.com");

        // WHEN & THEN
        mockMvc.perform(MockMvcRequestBuilders.put(URL + "/" + student.getId())
                .content(objectMapper.writeValueAsString(updatedDTO))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.firstName").value("New"));
    }

    /**
     * Test deleting a student by ID.
     */
    @Test
    @WithMockUser
    public void deleteStudentSuccessful() throws Exception {
        // GIVEN
        Student student = new Student();
        student.setFirstName("To");
        student.setLastName("Delete");
        student.setEmail("delete@example.com");
        student = studentRepository.save(student);

        // WHEN & THEN
        mockMvc.perform(MockMvcRequestBuilders.delete(URL + "/" + student.getId()))
                .andExpect(MockMvcResultMatchers.status().isNoContent());
        
        assertThat(studentRepository.findById(student.getId())).isEmpty();
    }

    /**
     * Test deleting all students.
     */
    @Test
    @WithMockUser
    public void deleteAllStudentsSuccessful() throws Exception {
        // GIVEN
        Student student = new Student();
        student.setFirstName("Any");
        student.setLastName("Student");
        student.setEmail("any@example.com");
        studentRepository.save(student);

        // WHEN & THEN
        mockMvc.perform(MockMvcRequestBuilders.delete(URL))
                .andExpect(MockMvcResultMatchers.status().isNoContent());
        
        assertThat(studentRepository.count()).isEqualTo(0);
    }
}
