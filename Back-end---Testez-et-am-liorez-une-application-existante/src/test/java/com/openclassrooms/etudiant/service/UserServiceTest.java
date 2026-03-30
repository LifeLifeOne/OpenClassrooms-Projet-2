package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for UserService.
 * Focuses on user registration and login.
 */
@ExtendWith(SpringExtension.class)
public class UserServiceTest {
    private static final String FIRST_NAME = "John";
    private static final String LAST_NAME = "Doe";
    private static final String LOGIN = "LOGIN";
    private static final String PASSWORD = "PASSWORD";
    
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    
    @InjectMocks
    private UserService userService;

    /**
     * Test creating a null user.
     */
    @Test
    public void createNullUserThrowsException() {
        Assertions.assertThrows(IllegalArgumentException.class,
                () -> userService.register(null));
    }

    /**
     * Test creating an already existing user.
     */
    @Test
    public void createAlreadyExistUserThrowsIllegalArgumentException() {
        // GIVEN
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        when(passwordEncoder.encode(PASSWORD)).thenReturn(PASSWORD);
        when(userRepository.findByLogin(any())).thenReturn(Optional.of(user));

        // THEN
        Assertions.assertThrows(IllegalArgumentException.class,
                () -> userService.register(user));
    }

    /**
     * Test successful user registration.
     */
    @Test
    public void createUserSuccess() {
        // GIVEN
        User user = new User();
        user.setFirstName(FIRST_NAME);
        user.setLastName(LAST_NAME);
        user.setLogin(LOGIN);
        user.setPassword(PASSWORD);
        when(passwordEncoder.encode(PASSWORD)).thenReturn("encodedPassword");
        when(userRepository.findByLogin(any())).thenReturn(Optional.empty());

        // WHEN
        userService.register(user);

        // THEN
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("encodedPassword");
    }

    /**
     * Test successful login.
     */
    @Test
    public void loginSuccess() {
        // GIVEN
        User user = new User();
        user.setLogin(LOGIN);
        user.setPassword("encodedPassword");
        when(userRepository.findByLogin(LOGIN)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD, "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("mockToken");

        // WHEN
        String token = userService.login(LOGIN, PASSWORD);

        // THEN
        assertThat(token).isEqualTo("mockToken");
    }

    /**
     * Test login with invalid credentials.
     */
    @Test
    public void loginInvalidCredentialsThrowsException() {
        // GIVEN
        when(userRepository.findByLogin(LOGIN)).thenReturn(Optional.empty());

        // THEN
        Assertions.assertThrows(IllegalArgumentException.class,
                () -> userService.login(LOGIN, PASSWORD));
    }

    /**
     * Test fetching all users.
     */
    @Test
    public void getUsersReturnsList() {
        // GIVEN
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        // WHEN
        List<User> users = userService.getUsers();

        // THEN
        assertThat(users).isEmpty();
        verify(userRepository).findAll();
    }

    /**
     * Test deleting all users.
     */
    @Test
    public void deleteAllClearsRepository() {
        // WHEN
        userService.deleteAll();

        // THEN
        verify(userRepository).deleteAll();
    }
}
